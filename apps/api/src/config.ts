import { z } from 'zod';

export const EnvSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  // Per-identity public booking limits per minute
  RATE_LIMIT_EMAIL_PER_MIN: z.coerce.number().default(5),
  RATE_LIMIT_PHONE_PER_MIN: z.coerce.number().default(5),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return EnvSchema.parse(env);
}

