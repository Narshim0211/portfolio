## Salon Booking Platform — Developer Documentation

This documentation is the canonical source for architecture, setup, security, and development conventions. The goal is clarity and reliability so any developer can onboard quickly and safely.

### Repository Structure

```
apps/
  api/            # Fastify API (TS)
packages/
  core-domain/    # Domain logic (availability, holds, idempotency)
  data-access/    # Prisma schema and client
  contracts/      # Shared zod schemas and types
docs/             # Documentation site and guides
```

### Local Setup

1. Install Node.js 20+ and pnpm/npm.
2. Copy `.env.example` to `.env` and adjust if needed.
3. Run Postgres and Redis (Docker is preferred in dev; if not available, point to managed instances):
   - Database: `postgresql://app:app@localhost:5432/salon?schema=public`
   - Redis: `redis://localhost:6379`
4. Install dependencies at repo root: `npm install`.
5. Generate Prisma client: `npm run db:generate`.
6. Start API: `npm run dev:api`.

### Security Defaults

- Helmet with CSP and secure headers
- Strict CORS allowlist via env `ALLOWED_ORIGINS`
- Rate limiting on all routes
- No secrets in frontend (frontend app to be added separately)

### Next Steps

- Implement DB extensions and exclusion constraint via manual migration SQL (see `data-access`).
- Build public endpoints with zod validation using `@salon/contracts`.
- Add email/queue integrations, observability, and admin/public UIs.

### Index

- Onboarding: ONBOARDING.md
- Architecture: architecture-overview.md
- Security: security.md
- Testing Strategy: testing-strategy.md
- Setup (Local): setup-local.md
- API Reference: api-reference.md
- Env/Config: env-config.md
- Worker & Queue: worker-queue.md
- Public Wizard: public-wizard.md
- Embed Widget: embed-widget.md
- CAPTCHA & Embed: captcha-and-embed.md
- Runbooks: runbooks.md

