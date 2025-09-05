import { z } from "zod";
import { DateSchema, IdSchema, IsoDateTimeSchema, SubdomainSchema } from "./shared";

export const ServiceSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  durationMin: z.number().int().positive(),
  bufferBefore: z.number().int().nonnegative().default(0),
  bufferAfter: z.number().int().nonnegative().default(0),
  category: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().default(true),
});

export const StaffSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  specialties: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const ListServicesResponse = z.object({
  services: z.array(ServiceSchema),
});

export const AvailabilityQuery = z.object({
  serviceId: IdSchema,
  staffId: IdSchema.optional(),
  date: DateSchema,
});

export const TimeSlotSchema = z.object({
  start: IsoDateTimeSchema,
  end: IsoDateTimeSchema,
  staffId: IdSchema,
});

export const AvailabilityResponse = z.object({
  slots: z.array(TimeSlotSchema),
});

export const CreateAppointmentBody = z.object({
  serviceId: IdSchema,
  staffId: IdSchema.nullable().optional(),
  datetimeStart: IsoDateTimeSchema,
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    notes: z.string().max(2000).optional(),
  }),
  policyAccepted: z.boolean(),
  idempotencyKey: z.string().min(8).max(128),
});

export const PaymentMode = z.enum([
  "confirmation_only",
  "in_person",
  "external_required",
]);

export const CreateAppointmentResponse = z.object({
  appointmentId: IdSchema,
  status: z.enum(["pending_payment", "confirmed", "cancelled"]).default("confirmed"),
  payment: z.object({
    mode: PaymentMode,
    url: z.string().url().optional(),
    expiresAt: IsoDateTimeSchema.optional(),
  }),
});

export const MarkPaidParams = z.object({
  id: IdSchema,
  subdomain: SubdomainSchema,
});

export const MarkPaidHeaders = z.object({
  "x-owner-signature": z.string(),
});

export const PublicAppointmentResponse = z.object({
  id: IdSchema,
  status: z.enum(["pending_payment", "confirmed", "cancelled", "noshow"]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
});

