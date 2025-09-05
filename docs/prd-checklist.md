## PRD Acceptance Checklist (v1)

Reliability & Performance
- [ ] Concurrency test proves no double-booking
- [ ] p95 < 300ms on GET services/availability under load
- [ ] Availability cache hit rate > 90%

Security
- [ ] Helmet + strict CORS verified
- [ ] Rate limits on public endpoints (IP + email/phone) verified
- [ ] HMAC mark-paid (if used) rejects invalid signatures
- [ ] CAPTCHA toggle documented & tested (if enabled)

Product Features
- [ ] Public booking wizard works E2E
- [ ] Admin: Services, Staff, Calendar, Settings functional
- [ ] Embed widget works with auto-resize and theming

Operations
- [ ] Backups and DR steps reviewed and tested (DB restore drill)
- [ ] /metrics scraped and alerts configured
- [ ] Runbooks available (5xx, queue backlog, DB failover, email outage, cache down)

Docs & DevEx
- [ ] Onboarding gets a new dev running in < 30 minutes
- [ ] API reference up to date with zod schemas
- [ ] Architecture, flows, and ADRs reviewed

