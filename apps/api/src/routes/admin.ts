import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BrandingSettingsSchema, PaymentSettingsSchema, AdminSettingsResponse, AdminCalendarQuery, AdminCalendarResponse, MoveAppointmentBody } from '@salon/contracts';
import { getPrisma } from '@salon/data-access';

// Temporary: tenant identification by header for development
const TenantHeader = z.object({ 'x-tenant-id': z.string().uuid() });

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/admin/settings', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findUnique({ where: { id: headers['x-tenant-id'] } });
    if (!tenant) return reply.code(404).send({ message: 'Tenant not found' });

    const branding = {
      brandColor: (tenant.brandingJson as any)?.brandColor ?? '#111827',
      logoUrl: (tenant.brandingJson as any)?.logoUrl,
      postBookingRedirectUrl: (tenant.brandingJson as any)?.postBookingRedirectUrl,
    };
    const payments = {
      mode: tenant.paymentMode,
      externalPaymentUrl: tenant.externalPaymentUrl ?? undefined,
      paymentTtlSec: tenant.paymentTtlSec,
      callbackSecret: tenant.callbackSecret ?? undefined,
    } as any;
    return AdminSettingsResponse.parse({ branding, payments });
  });

  app.put('/admin/settings/branding', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const body = BrandingSettingsSchema.parse(request.body);
    const prisma = getPrisma();
    await prisma.tenant.update({
      where: { id: headers['x-tenant-id'] },
      data: { brandingJson: body },
    });
    return reply.code(204).send();
  });

  app.put('/admin/settings/payments', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const body = PaymentSettingsSchema.parse(request.body);
    const prisma = getPrisma();
    await prisma.tenant.update({
      where: { id: headers['x-tenant-id'] },
      data: {
        paymentMode: body.mode as any,
        externalPaymentUrl: body.externalPaymentUrl ?? null,
        paymentTtlSec: body.paymentTtlSec,
        callbackSecret: body.callbackSecret ?? null,
      },
    });
    return reply.code(204).send();
  });

  // Calendar: list appointments by range (UTC ISO)
  app.get('/admin/calendar', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const query = AdminCalendarQuery.parse(request.query);
    const prisma = getPrisma();
    const where: any = {
      tenantId: headers['x-tenant-id'],
      start: { lt: new Date(query.to) },
      end: { gt: new Date(query.from) },
    };
    if (query.staffId) where.staffId = query.staffId;
    const appts = await prisma.appointment.findMany({
      where,
      orderBy: { start: 'asc' },
      select: {
        id: true,
        staffId: true,
        serviceId: true,
        start: true,
        end: true,
        status: true,
        paymentStatus: true,
        customerName: true,
      },
    });
    return AdminCalendarResponse.parse({
      appointments: appts.map((a) => ({
        ...a,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
      })),
    });
  });

  // Move appointment: reassign staff and time
  app.put('/admin/appointments/:id/move', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const body = MoveAppointmentBody.parse(request.body);
    const id = z.string().uuid().parse((request.params as any).id);
    const prisma = getPrisma();

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const existing = await tx.appointment.findFirst({ where: { id, tenantId: headers['x-tenant-id'] }, select: { start: true, end: true } });
        if (!existing) {
          throw Object.assign(new Error('Not found'), { code: 'NOT_FOUND' });
        }
        const durationMs = body.keepDuration ? (existing.end.getTime() - existing.start.getTime()) : (existing.end.getTime() - existing.start.getTime());
        const newStart = new Date(body.newStart);
        const newEnd = new Date(newStart.getTime() + durationMs);
        return tx.appointment.update({
          where: { id },
          data: { staffId: body.newStaffId, start: newStart, end: newEnd },
          select: { id: true },
        });
      });
      return reply.code(200).send({ id: updated.id });
    } catch (e: any) {
      if (e?.code === 'NOT_FOUND') return reply.code(404).send({ message: 'Appointment not found' });
      return reply.code(409).send({ message: 'Conflict moving appointment' });
    }
  });
};

export default adminRoutes;

