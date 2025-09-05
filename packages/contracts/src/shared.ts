import { z } from "zod";

export const IdSchema = z.string().uuid();

export const SubdomainSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/);

export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const IsoDateTimeSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid ISO datetime",
  });

export type Id = z.infer<typeof IdSchema>;

