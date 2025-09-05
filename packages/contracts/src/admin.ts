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

// Services CRUD
export const AdminServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  durationMin: z.number().int().positive(),
  bufferBefore: z.number().int().nonnegative().default(0),
  bufferAfter: z.number().int().nonnegative().default(0),
  category: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().default(true),
});

export const AdminServicesResponse = z.object({
  services: z.array(AdminServiceSchema),
});

export const CreateServiceBody = z.object({
  name: z.string().min(1),
  durationMin: z.number().int().positive(),
  bufferBefore: z.number().int().nonnegative().default(0),
  bufferAfter: z.number().int().nonnegative().default(0),
  category: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().default(true),
});

export const UpdateServiceBody = CreateServiceBody.partial();

// Staff CRUD & availability
export const AdminStaffSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  tz: z.string().min(1),
  specialties: z.array(z.string()),
  active: z.boolean().default(true),
});

export const AdminStaffResponse = z.object({
  staff: z.array(AdminStaffSchema),
});

export const CreateStaffBody = z.object({
  name: z.string().min(1),
  tz: z.string().min(1),
  specialties: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const UpdateStaffBody = CreateStaffBody.partial();

export const StaffHoursBody = z.object({
  rrule: z.string().min(5),
  tz: z.string().min(1),
});

export const StaffTimeOffBody = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

