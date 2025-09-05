## Security Policy

### Design Principles
- No secrets in the frontend; all secrets are server-side env vars.
- Validate every input with zod; reject early with clear errors.
- Defense in depth: Redis holds + DB exclusion constraint for bookings.
- Least privilege: separate roles (owner, frontdesk, staff).
- Safe defaults: Helmet headers, strict CORS, rate limits on public endpoints.

### Reporting a Vulnerability
Please open a private issue or contact the maintainers with detailed steps to reproduce. Do not disclose publicly until a fix is available.

### Secure Coding Checklist
- Use parameterized queries via Prisma. Never build SQL strings manually.
- Validate bodies, params, and headers with `packages/contracts` zod schemas.
- Sanitize outputs for UI where needed; rely on React escaping by default.
- Never log PII or secrets; logs must be structured and redacted.
- Keep dependencies updated; review `npm audit` reports in CI.

### Runtime Protections
- HTTP headers: HSTS, CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options.
- CORS: allow only known origins from `ALLOWED_ORIGINS`.
- Rate limiting: per-IP and per-identity (email/phone) on booking.
- HMAC-signed callbacks: verify `X-Owner-Signature` for mark-paid.