### Architecture Overview

This system is a modular monolith with strict boundaries between frontend and backend deploys. Key modules:

- apps/api: Fastify (TS) stateless API
- packages/core-domain: pure domain logic (availability, Redis holds, idempotency)
- packages/data-access: Prisma models and DB access
- packages/contracts: shared zod schemas for runtime validation and type inference

Data stores:
- Postgres: primary system of record
- Redis: availability cache, slot holds, idempotency keys
- Queue (future): email/SMS/webhook jobs

Security and safety:
- API only; no secrets in the frontend
- HMAC verification for owner callbacks
- Rate limiting, CORS, Helmet, validation at every boundary

Sequence (booking, simplified):
1) Client selects service/staff/date → API serves cached availability
2) Client posts booking → API acquires Redis hold → DB transaction inserts appointment → publish notifications → invalidate cache
3) If payment mode is external_required → pending_payment → redirect to external payment link; upon signed callback → mark paid + confirmed

