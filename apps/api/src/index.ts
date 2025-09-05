import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Redis from "ioredis";
import { z } from "zod";

const EnvSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173,http://localhost:3000"),
});

const env = EnvSchema.parse(process.env);

const app = Fastify({
  logger: true,
});

await app.register(helmet, {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:"],
    },
  },
});

const allowedOrigins = new Set(env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()));
await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    cb(new Error("Origin not allowed"), false);
  },
  credentials: true,
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  allowList: [],
});

const redis = new Redis(env.REDIS_URL);

app.get("/healthz", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

