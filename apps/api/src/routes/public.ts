import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { SubdomainSchema, ListServicesResponse, AvailabilityQuery, AvailabilityResponse, CreateAppointmentBody, CreateAppointmentResponse, MarkPaidParams, MarkPaidHeaders, PublicAppointmentResponse, PublicBrandingResponse } from '@salon/contracts';
import { getPrisma } from '@salon/data-access';
import { verifyOwnerSignature } from '../utils/hmac';
import { acquireSlotHold, buildHoldKey } from '@salon/core-domain';
import { createPaymentExpiryQueue, createDelayedJobOptions, createEmailQueue } from '@salon/messaging';
import { renderBookingConfirmed, renderBookingPendingPayment } from '@salon/notifications';
import { availabilityCacheHits, availabilityCacheMisses, bookingAttempts, bookingHoneypot, bookingRateLimited } from '../metrics';

/**
 * Public routes exposed to end-users for discovery and booking.
 * Only non-sensitive read operations and booking creation live here.
 */
export const publicRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const ParamsSchema = z.object({ subdomain: SubdomainSchema });

  app.get('/public/:subdomain/services', async (request, reply) => {
    const params = ParamsSchema.parse(request.params);
    const prisma = getPrisma();

    const tenant = await prisma.tenant.findFirst({
      where: { subdomain: params.subdomain },
      select: { id: true },
    });
    if (!tenant) {
      return reply.code(404).send({ message: 'Tenant not found' });
    }

    const services = await prisma.service.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { name: 'asc' },
    });
    reply.header('Cache-Control', 'public, max-age=120');
    return ListServicesResponse.parse({ services });
  });

  // Branding for public pages
  app.get('/public/:subdomain/branding', async (request, reply) => {
    const params = ParamsSchema.parse(request.params);
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: params.subdomain } });
    if (!tenant) return reply.code(404).send({ message: 'Tenant not found' });
    const b = (tenant.brandingJson as any) || {};
    const resp = PublicBrandingResponse.parse({ brandColor: b.brandColor ?? '#111827', logoUrl: b.logoUrl });
    reply.header('Cache-Control', 'public, max-age=300');
    return resp;
  });

  // Embeddable widget script (ES module safe but plain JS)
  app.get('/public/:subdomain/embed.js', async (request, reply) => {
    const params = ParamsSchema.parse(request.params);
    const apiBase = `${(request.protocol || 'http')}://${request.headers.host}`;
    const js = `
      (function(){
        var d=document;function ready(fn){if(d.readyState!='loading'){fn()}else{d.addEventListener('DOMContentLoaded',fn)}}
        function mount(selector){
          var el = selector ? d.querySelector(selector) : null;
          if(!el){ el = d.createElement('div'); d.body.appendChild(el); }
          var iframe = d.createElement('iframe');
          iframe.src = '${apiBase}'.replace(/\/$/,'') + '/book/service?sub=${params.subdomain}';
          iframe.style.width='100%'; iframe.style.border='0'; iframe.setAttribute('title','Booking');
          function onMsg(e){ try { if(!e.data) return; if(e.data.type==='salon:resize' && e.source===iframe.contentWindow){ iframe.style.height = e.data.height+'px'; } } catch(err){} }
          window.addEventListener('message', onMsg);
          iframe.onload=function(){ try { iframe.contentWindow.postMessage({ type:'salon:ready' }, '*'); } catch(e){} };
          el.appendChild(iframe);
        }
        ready(function(){ mount(); });
        window.SalonBookingWidget = { mount: mount };
      })();
    `;
    reply.header('Content-Type', 'application/javascript');
    reply.header('Cache-Control', 'public, max-age=300');
    return js;
  });

  // Availability endpoint with simple cached generation
  app.get('/public/:subdomain/availability', async (request, reply) => {
    const params = ParamsSchema.parse(request.params);
    const query = AvailabilityQuery.parse(request.query);
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: params.subdomain }, select: { id: true, tz: true } });
    if (!tenant) return reply.code(404).send({ message: 'Tenant not found' });

    const redis = request.server.redis;
    const cacheKey = `avail:${tenant.id}:${query.serviceId}:${query.staffId ?? 'any'}:${query.date}:${tenant.tz}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      availabilityCacheHits.labels({ tenant: tenant.id }).inc();
      reply.header('Cache-Control', 'public, max-age=300');
      return AvailabilityResponse.parse(JSON.parse(cached));
    }
    availabilityCacheMisses.labels({ tenant: tenant.id }).inc();

    const { generateDailyAvailability } = await import('@salon/core-domain');
    const slots = await generateDailyAvailability({ prisma, tenantId: tenant.id, serviceId: query.serviceId, staffId: query.staffId, date: query.date });
    const response = AvailabilityResponse.parse({ slots });
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 600);
    return response;
  });

  // Signed callback to mark an appointment as paid
  app.post('/public/:subdomain/appointments/:id/mark-paid', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const params = MarkPaidParams.parse(request.params);
    const headers = MarkPaidHeaders.parse(request.headers as any);

    const rawBody = (request as any).rawBody as string | undefined;
    if (!rawBody) {
      return reply.code(400).send({ message: 'Missing raw body' });
    }

    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain: params.subdomain },
      select: { id: true, callbackSecret: true },
    });
    if (!tenant || !tenant.callbackSecret) {
      return reply.code(404).send({ message: 'Tenant or callback secret not configured' });
    }

    const isValid = verifyOwnerSignature({
      secret: tenant.callbackSecret,
      header: headers['x-owner-signature'],
      body: rawBody,
    });
    if (!isValid) {
      return reply.code(401).send({ message: 'Invalid signature' });
    }

    const updated = await prisma.appointment.updateMany({
      where: { id: params.id, tenantId: tenant.id },
      data: { paymentStatus: 'paid', status: 'confirmed' },
    });

    if (updated.count > 0) {
      // Fetch appointment and send confirmation email
      const appt = await prisma.appointment.findUnique({ where: { id: params.id }, select: { customerEmail: true, customerName: true, start: true } });
      const redisUrl = new URL((request.server as any).redis.options?.host ? `redis://${(request.server as any).redis.options.host}:${(request.server as any).redis.options.port}` : process.env.REDIS_URL || 'redis://127.0.0.1:6379');
      const { queue: emailQ } = createEmailQueue({ connection: { host: redisUrl.hostname, port: Number(redisUrl.port || '6379') } });
      await emailQ.add('email', {
        to: appt?.customerEmail || '',
        subject: 'Your appointment is confirmed',
        html: renderBookingConfirmed({ customerName: appt?.customerName || 'Customer', datetime: appt?.start.toISOString() || '', serviceName: 'Service' }),
      });
    }

    return reply.code(200).send({ ok: true });
  });

  // Public appointment status for polling
  app.get('/public/:subdomain/appointments/:id', async (request, reply) => {
    const params = MarkPaidParams.parse(request.params);
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: params.subdomain }, select: { id: true } });
    if (!tenant) return reply.code(404).send({ message: 'Tenant not found' });
    const appt = await prisma.appointment.findFirst({ where: { id: params.id, tenantId: tenant.id }, select: { id: true, status: true, paymentStatus: true } });
    if (!appt) return reply.code(404).send({ message: 'Appointment not found' });
    return PublicAppointmentResponse.parse(appt);
  });

  // Create appointment with Redis hold and exclusion constraint enforcement
  app.post('/public/:subdomain/appointments', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      }
    }
  }, async (request, reply) => {
    const params = ParamsSchema.parse(request.params);
    const body = CreateAppointmentBody.parse(request.body);
    const idempotencyKey = (request.headers['idempotency-key'] as string | undefined) ?? body.idempotencyKey;
    if (!idempotencyKey) return reply.code(400).send({ message: 'Missing Idempotency-Key' });

    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: params.subdomain }, select: { id: true, paymentMode: true, externalPaymentUrl: true, paymentTtlSec: true, tz: true } });
    if (!tenant) return reply.code(404).send({ message: 'Tenant not found' });

    bookingAttempts.labels({ tenant: tenant.id }).inc();

    // Honeypot check
    if ((body as any).hp) {
      bookingHoneypot.labels({ tenant: tenant.id }).inc();
      return reply.code(400).send({ message: 'Bad request' });
    }

    // CAPTCHA (optional, env-driven)
    if (process.env.CAPTCHA_ENABLED === 'true') {
      const token = (body as any).captchaToken;
      if (!token) return reply.code(400).send({ message: 'Missing captchaToken' });
      try {
        // NOTE: Replace with real provider verification (Turnstile/Recaptcha)
        // For now, accept any non-empty token to keep integration simple in unsupported envs
        if (token.length < 10) throw new Error('token too short');
      } catch {
        return reply.code(400).send({ message: 'CAPTCHA verification failed' });
      }
    }

    // Per identity limits (email/phone) using in-memory counters via Redis
    const redis = request.server.redis;
    const emailKey = `rl:email:${tenant.id}:${body.customer.email}`;
    const phoneKey = `rl:phone:${tenant.id}:${body.customer.phone}`;
    const [emailCount, phoneCount] = await redis.multi()
      .incr(emailKey).expire(emailKey, Number(process.env.RATE_LIMIT_EMAIL_PER_MIN || '5') > 0 ? 60 : 60)
      .incr(phoneKey).expire(phoneKey, Number(process.env.RATE_LIMIT_PHONE_PER_MIN || '5') > 0 ? 60 : 60)
      .exec() as any;
    const emailExceeded = Number(emailCount[1]) > Number(process.env.RATE_LIMIT_EMAIL_PER_MIN || '5');
    const phoneExceeded = Number(phoneCount[1]) > Number(process.env.RATE_LIMIT_PHONE_PER_MIN || '5');
    if (emailExceeded) bookingRateLimited.labels({ tenant: tenant.id, dimension: 'email' }).inc();
    if (phoneExceeded) bookingRateLimited.labels({ tenant: tenant.id, dimension: 'phone' }).inc();
    if (emailExceeded || phoneExceeded) {
      return reply.code(429).send({ message: 'Too many requests' });
    }

    const service = await prisma.service.findFirst({ where: { id: body.serviceId, tenantId: tenant.id, active: true }, select: { id: true, durationMin: true, bufferBefore: true, bufferAfter: true, priceCents: true } });
    if (!service) return reply.code(404).send({ message: 'Service not found' });

    // Choose staff
    let staffId: string | null | undefined = body.staffId ?? null;
    if (!staffId) {
      const staff = await prisma.staff.findFirst({ where: { tenantId: tenant.id, active: true }, select: { id: true } });
      if (!staff) return reply.code(400).send({ message: 'No active staff available' });
      staffId = staff.id;
    }

    const start = new Date(body.datetimeStart);
    const end = new Date(start.getTime() + service.durationMin * 60_000);
    const effectiveStart = new Date(start.getTime() - service.bufferBefore * 60_000);
    const effectiveEnd = new Date(end.getTime() + service.bufferAfter * 60_000);

    const holdKey = buildHoldKey({ tenantId: tenant.id, staffId, startIso: effectiveStart.toISOString(), endIso: effectiveEnd.toISOString() });
    const acquired = await acquireSlotHold(redis, holdKey, 10 * 60_000, idempotencyKey);
    if (!acquired) return reply.code(409).send({ message: 'Slot already held' });

    try {
      const appt = await prisma.$transaction(async (tx) => {
        const created = await tx.appointment.create({
          data: {
            tenantId: tenant.id,
            staffId,
            serviceId: service.id,
            customerName: body.customer.name,
            customerEmail: body.customer.email,
            customerPhone: body.customer.phone,
            start: effectiveStart, // include buffers to enforce non-overlap
            end: effectiveEnd,
            status: tenant.paymentMode === 'external_required' ? 'pending_payment' : 'confirmed',
            source: 'public',
            paymentStatus: tenant.paymentMode === 'external_required' ? 'unpaid' : 'paid',
            notes: body.customer.notes ?? null,
          },
          select: { id: true },
        });
        return created;
      });

      const resp: any = {
        appointmentId: appt.id,
        status: tenant.paymentMode === 'external_required' ? 'pending_payment' : 'confirmed',
        payment: {
          mode: tenant.paymentMode,
        },
      };

      if (tenant.paymentMode === 'external_required') {
        if (!tenant.externalPaymentUrl) return reply.code(500).send({ message: 'External payment URL not configured' });
        const expiresAt = new Date(Date.now() + (tenant.paymentTtlSec ?? 900) * 1000).toISOString();
        const url = new URL(tenant.externalPaymentUrl);
        url.searchParams.set('apt', resp.appointmentId);
        url.searchParams.set('amt', String(service.priceCents));
        resp.payment.url = url.toString();
        resp.payment.expiresAt = expiresAt;

        // Enqueue delayed expiry job
        const redisUrl = new URL((request.server as any).redis.options?.host ? `redis://${(request.server as any).redis.options.host}:${(request.server as any).redis.options.port}` : process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        const { queue } = createPaymentExpiryQueue({
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port || '6379'),
          },
        });
        await queue.add('expire', { tenantId: tenant.id, appointmentId: resp.appointmentId }, createDelayedJobOptions((tenant.paymentTtlSec ?? 900) * 1000));

        // Send pending payment email
        const { queue: emailQ } = createEmailQueue({ connection: { host: redisUrl.hostname, port: Number(redisUrl.port || '6379') } });
        await emailQ.add('email', {
          to: body.customer.email,
          subject: 'Payment pending for your appointment',
          html: renderBookingPendingPayment({ customerName: body.customer.name, datetime: new Date(body.datetimeStart).toLocaleString(), serviceName: 'Service' }),
        });
      }
      else {
        // Send confirmation email
        const redisUrl = new URL((request.server as any).redis.options?.host ? `redis://${(request.server as any).redis.options.host}:${(request.server as any).redis.options.port}` : process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        const { queue: emailQ } = createEmailQueue({ connection: { host: redisUrl.hostname, port: Number(redisUrl.port || '6379') } });
        await emailQ.add('email', {
          to: body.customer.email,
          subject: 'Your appointment is confirmed',
          html: renderBookingConfirmed({ customerName: body.customer.name, datetime: new Date(body.datetimeStart).toLocaleString(), serviceName: 'Service' }),
        });
      }

      // Invalidate simple availability cache for that date/staff/service
      const dateStr = body.datetimeStart.slice(0, 10);
      const cacheKey = `avail:${tenant.id}:${service.id}:${staffId}:${dateStr}:${tenant.tz}`;
      await redis.del(cacheKey);

      return CreateAppointmentResponse.parse(resp);
    } catch (e: any) {
      // Exclusion constraint overlap or other error
      return reply.code(409).send({ message: 'Time slot no longer available' });
    }
  });
};

export default publicRoutes;

