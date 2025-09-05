import { z } from 'zod';

export const BrandingSettingsSchema = z.object({
  brandColor: z.string().min(1).default('#111827'),
  logoUrl: z.string().url().optional(),
  postBookingRedirectUrl: z.string().url().optional(),
});

export const PaymentSettingsSchema = z.object({
  mode: z.enum(['confirmation_only', 'in_person', 'external_required']),
  externalPaymentUrl: z.string().url().optional(),
  paymentTtlSec: z.number().int().min(60).max(3600).default(900),
  callbackSecret: z.string().min(12).optional(),
});

export const AdminSettingsResponse = z.object({
  branding: BrandingSettingsSchema,
  payments: PaymentSettingsSchema,
});

// Calendar
export const AdminCalendarQuery = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  staffId: z.string().uuid().optional(),
});

export const AdminCalendarAppointment = z.object({
  id: z.string().uuid(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  status: z.enum(['pending_payment','confirmed','cancelled','noshow']),
  paymentStatus: z.enum(['unpaid','paid','refunded']),
  customerName: z.string(),
});

export const AdminCalendarResponse = z.object({
  appointments: z.array(AdminCalendarAppointment),
});

export const MoveAppointmentBody = z.object({
  newStaffId: z.string().uuid(),
  newStart: z.string().datetime(),
  keepDuration: z.boolean().default(true),
});

