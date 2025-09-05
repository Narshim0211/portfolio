import { addMinutes, isBefore, isEqual } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import type { PrismaClient } from '@prisma/client';

export interface AvailabilityParams {
  prisma: PrismaClient;
  tenantId: string;
  serviceId: string;
  staffId?: string;
  date: string; // YYYY-MM-DD in tenant tz
}

export interface TimeSlot {
  start: string; // ISO UTC
  end: string;   // ISO UTC
  staffId: string;
}

/**
 * Generate simple availability for a given date using a default 09:00-17:00 window
 * in the tenant timezone and avoiding overlaps with existing appointments.
 * Buffers are respected by expanding the occupied intervals; slots are stepped
 * at 15 minutes. This is a pragmatic baseline until full business hours parsing
 * and PTO/lead-time are implemented.
 */
export async function generateDailyAvailability(params: AvailabilityParams): Promise<TimeSlot[]> {
  const { prisma, tenantId, serviceId, staffId, date } = params;

  const [tenant, service] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { tz: true } }),
    prisma.service.findUnique({ where: { id: serviceId }, select: { durationMin: true, bufferBefore: true, bufferAfter: true } }),
  ]);
  if (!tenant || !service) return [];

  const tz = tenant.tz;
  const workStartLocal = new Date(`${date}T09:00:00`);
  const workEndLocal = new Date(`${date}T17:00:00`);
  const workStartUtc = fromZonedTime(workStartLocal, tz);
  const workEndUtc = fromZonedTime(workEndLocal, tz);

  const staffList = staffId
    ? await prisma.staff.findMany({ where: { id: staffId, tenantId, active: true }, select: { id: true } })
    : await prisma.staff.findMany({ where: { tenantId, active: true }, select: { id: true } });

  const stepMin = 15;
  const serviceTotalMin = service.durationMin; // UI duration; buffers applied around existing appts
  const slots: TimeSlot[] = [];

  // Fetch existing appointments for the day per staff and expand by buffers
  for (const s of staffList) {
    const appts = await prisma.appointment.findMany({
      where: {
        tenantId,
        staffId: s.id,
        start: { lt: workEndUtc },
        end: { gt: workStartUtc },
        status: { in: ['pending_payment', 'confirmed'] },
      },
      select: { start: true, end: true },
      orderBy: { start: 'asc' },
    });

    // Expand occupied intervals by service buffers
    const occupied: Array<{ start: Date; end: Date }> = appts.map((a) => ({
      start: addMinutes(a.start, -service.bufferBefore),
      end: addMinutes(a.end, service.bufferAfter),
    }));

    // Iterate candidate slots
    for (let cursor = workStartUtc; isBefore(cursor, workEndUtc) || isEqual(cursor, workEndUtc); cursor = addMinutes(cursor, stepMin)) {
      const end = addMinutes(cursor, serviceTotalMin);
      if (isBefore(end, cursor) || !isBefore(end, workEndUtc)) continue;

      // Check overlap against occupied windows
      const overlaps = occupied.some((o) => o.start < end && o.end > cursor);
      if (overlaps) continue;

      slots.push({ start: cursor.toISOString(), end: end.toISOString(), staffId: s.id });
    }
  }

  return slots;
}

