import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AdminStaffResponse, CreateStaffBody, UpdateStaffBody, StaffHoursBody, StaffTimeOffBody } from '@salon/contracts';
import { getPrisma } from '@salon/data-access';

const TenantHeader = z.object({ 'x-tenant-id': z.string().uuid() });

export const adminStaffRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/admin/staff', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const prisma = getPrisma();
    const staff = await prisma.staff.findMany({ where: { tenantId: headers['x-tenant-id'] }, orderBy: { name: 'asc' } });
    return AdminStaffResponse.parse({ staff });
  });

  app.post('/admin/staff', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const body = CreateStaffBody.parse(request.body);
    const prisma = getPrisma();
    const created = await prisma.staff.create({ data: { tenantId: headers['x-tenant-id'], ...body } });
    return reply.code(201).send({ id: created.id });
  });

  app.put('/admin/staff/:id', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const id = z.string().uuid().parse((request.params as any).id);
    const body = UpdateStaffBody.parse(request.body);
    const prisma = getPrisma();
    await prisma.staff.update({ where: { id }, data: body });
    return reply.code(204).send();
  });

  // Working hours (RRULE per staff)
  app.put('/admin/staff/:id/hours', async (request, reply) => {
    const headers = TenantHeader.parse(request.headers as any);
    const id = z.string().uuid().parse((request.params as any).id);
    const body = StaffHoursBody.parse(request.body);
    const prisma = getPrisma();
    await prisma.businessHours.create({ data: { tenantId: headers['x-tenant-id'], staffId: id, rrule: body.rrule, tz: body.tz } });
    return reply.code(201).send();
  });

  // PTO/Time off
  app.post('/admin/staff/:id/timeoff', async (request, reply) => {
    const id = z.string().uuid().parse((request.params as any).id);
    const body = StaffTimeOffBody.parse(request.body);
    const prisma = getPrisma();
    await prisma.timeOff.create({ data: { staffId: id, start: new Date(body.start), end: new Date(body.end) } });
    return reply.code(201).send();
  });
};

export default adminStaffRoutes;

