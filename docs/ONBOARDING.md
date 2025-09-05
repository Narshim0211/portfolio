## Developer Onboarding

Welcome to the Salon Booking Platform codebase. This guide helps you set up locally, understand the architecture, and navigate the repo quickly.

### Repo Structure

```
apps/
  api/            # Fastify API (TypeScript)
  web/            # Next.js Admin/Public UI (TypeScript)
  worker/         # Background worker (payments TTL, notifications)
packages/
  contracts/      # Shared zod schemas & types (API contracts)
  data-access/    # Prisma models & client
  core-domain/    # Domain logic (availability, holds, idempotency)
  messaging/      # BullMQ job definitions & helpers
  notifications/  # Email templates and sender (stub)
docs/             # Architecture, security, testing, runbooks, etc.
```

### Quick Start

1) Install Node.js 20+
2) Copy `.env.example` → `.env` (root and apps/web)
3) Install deps: `npm install`
4) Generate Prisma client: `npm run db:generate`
5) Start API: `npm run dev:api`
6) Start Web: `npm --workspace apps/web run dev`

Optional: Start Redis/Postgres via Docker locally (if available). Otherwise point `DATABASE_URL` and `REDIS_URL` to managed instances.

### What to Read First

- `docs/architecture-overview.md`: high-level design, modules, flows
- `docs/security.md`: security model and protections
- `docs/public-wizard.md`: public booking flow
- `docs/worker-queue.md`: queue and worker design
- `docs/runbooks.md`: incident runbooks
- `CONTRIBUTING.md`: code style, testing, PR conventions

### Development Commands

- Build all: `npm run build`
- Typecheck: `npm run typecheck`
- Tests (Vitest): `npm run test`
- API dev: `npm run dev:api`
- Web dev: `npm --workspace apps/web run dev`

### Architecture Highlights

- Fastify API with Helmet, strict CORS, rate limits, zod validation
- Prisma + Postgres with exclusion constraint to prevent overlaps
- Redis for availability caching, slot holds, and idempotency
- BullMQ for delayed TTL expiry and notifications
- Next.js UI (Admin + Public) with react-hook-form + zod; Suspense-safe routing
- Observability via Prometheus metrics at `/metrics`

### Coding Conventions

- TypeScript everywhere; explicit types at module boundaries
- Zod schemas in `packages/contracts` for validation + inference
- Avoid secrets in frontend; use server env vars only
- Keep functions small; guard clauses; handle errors meaningfully

