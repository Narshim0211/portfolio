# API (Fastify)

Purpose: stateless HTTP API serving public and admin endpoints. Validates all inputs via zod, enforces security headers and CORS, rate-limits public endpoints, and exposes metrics.

## Run
```
npm --workspace apps/api run dev
```

Env vars: see `../../docs/env-config.md`.

## Key Files
- src/index.ts: bootstrap, security, metrics, routes registration
- src/routes/public.ts: public services, availability, booking, mark-paid
- src/routes/admin*.ts: admin settings/services/staff/calendar
- src/utils/hmac.ts: HMAC signature verification

## Common Issues
- 409 on booking: time slot conflict; try another slot
- 401 on mark-paid: bad HMAC signature; verify secret and body

