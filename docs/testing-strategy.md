### Testing Strategy

- Unit (packages/core-domain): slot generation utilities, Redis hold keys, idempotency behavior
- Integration (apps/api): validate zod contracts, error paths, rate limits (with mocked DB/Redis)
- E2E: public booking flow (happy path), concurrent booking race test, external payment pending/expiry
- Load: availability endpoints p95<300ms under expected RPS
- Security: SAST/secret scanning in CI; DAST on staging; pen-test pre-GA

CI gates: typecheck, unit+integration tests, prisma generate, lint, security scan.

