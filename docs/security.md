### Security Model

- Authentication: HTTP-only cookies or JWT + refresh rotation (to be implemented in admin UI/API)
- RBAC: owner, frontdesk, staff
- Validation: all requests validated with zod contracts
- Headers: Helmet (HSTS, CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options)
- CORS: strict allowlist via ALLOWED_ORIGINS
- Rate limiting: per-IP for public endpoints
- Payment safety: external-only; HMAC-signed callbacks; application never touches card data
- Logging: structured, no PII in logs, secrets redacted
- Secrets: never committed; env-injected at runtime
- DB safety: exclusion constraint + Redis holds to prevent double-booking

HMAC header format: `X-Owner-Signature: sha256=<hex>` where `<hex>` = HMAC-SHA256 of request body using per-tenant secret.

