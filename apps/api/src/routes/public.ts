import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { SubdomainSchema, ListServicesResponse, MarkPaidParams, MarkPaidHeaders } from '@salon/contracts';
import { getPrisma } from '@salon/data-access';
import { verifyOwnerSignature } from '../utils/hmac';

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

    return ListServicesResponse.parse({ services });
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

    await prisma.appointment.updateMany({
      where: { id: params.id, tenantId: tenant.id },
      data: { paymentStatus: 'paid', status: 'confirmed' },
    });

    return reply.code(200).send({ ok: true });
  });
};

export default publicRoutes;

