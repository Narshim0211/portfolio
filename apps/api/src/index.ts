import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import compress from "@fastify/compress";
import Redis from "ioredis";
import { loadConfig } from "./config";
import publicRoutes from "./routes/public";
import rawBodyPlugin from "./plugins/rawBody";
import adminRoutes from "./routes/admin";
import adminServicesRoutes from "./routes/admin.services";
import adminStaffRoutes from "./routes/admin.staff";
import { registry, httpRequestsTotal } from "./metrics";

const env = loadConfig();

const app = Fastify({
  logger: {
    transport: env.NODE_ENV === "development" ? {
      target: "pino-pretty",
      options: { colorize: true }
    } : undefined
  },
});

const start = async () => {
  try {
    // Security headers
    await app.register(helmet, {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "img-src": ["'self'", "data:"],
        },
      },
    });

    // CORS allowlist
    const allowedOrigins = new Set(env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()));
    await app.register(cors, {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        cb(new Error("Origin not allowed"), false);
      },
      credentials: true,
    });

    // Rate limiting
    await app.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      allowList: [],
    });

    // Compression (Brotli/Gzip)
    await app.register(compress, { global: true, brotliOptions: { quality: 5 } });

    // Redis client (shared)
    const redis = new Redis(env.REDIS_URL);
    app.decorate("redis", redis);

    // Health endpoint
    app.get("/healthz", async () => ({ status: "ok" }));

    // Metrics endpoint (Prometheus exposition format)
    app.get("/metrics", async (request, reply) => {
      reply.header("Content-Type", registry.contentType);
      return registry.metrics();
    });

    // Basic HTTP metrics: count per method/route/status
    app.addHook("onResponse", async (request, reply) => {
      try {
        const method = request.method;
        const route = (request as any).routeOptions?.url || (request as any).routerPath || request.url;
        const status = String(reply.statusCode);
        httpRequestsTotal.labels({ method, route, status }).inc();
      } catch {}
    });

    // Raw body capture for HMAC-verified routes
    await app.register(rawBodyPlugin);

    // Public booking APIs
    await app.register(publicRoutes);

    // Admin APIs
    await app.register(adminRoutes);
    await app.register(adminServicesRoutes);
    await app.register(adminStaffRoutes);

    await app.listen({ port: env.API_PORT, host: env.API_HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

