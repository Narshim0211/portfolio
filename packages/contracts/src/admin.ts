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

