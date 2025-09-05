import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AdminServicesResponse, CreateServiceBody, UpdateServiceBody } from '@salon/contracts';
import { getPrisma } from '@salon/data-access';

const TenantHeader = z.object({ 'x-tenant-id': z.string().uuid() });

export const adminServicesRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/admin/services', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const prisma = getPrisma();
    const services = await prisma.service.findMany({ where: { tenantId: headers['x-tenant-id'] }, orderBy: { name: 'asc' } });
    return AdminServicesResponse.parse({ services });
  });

  app.post('/admin/services', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const body = CreateServiceBody.parse(request.body);
    const prisma = getPrisma();
    const created = await prisma.service.create({ data: { tenantId: headers['x-tenant-id'], ...body } });
    return reply.code(201).send({ id: created.id });
  });

  app.put('/admin/services/:id', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const id = z.string().uuid().parse((request.params as any).id);
    const body = UpdateServiceBody.parse(request.body);
    const prisma = getPrisma();
    await prisma.service.update({ where: { id }, data: body });
    return reply.code(204).send();
  });
};

export default adminServicesRoutes;

