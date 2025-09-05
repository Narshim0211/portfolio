import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BrandingSettingsSchema, PaymentSettingsSchema, AdminSettingsResponse } from '@salon/contracts';
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
};

export default adminRoutes;

