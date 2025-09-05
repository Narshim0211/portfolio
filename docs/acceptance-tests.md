## Acceptance & Load Tests

### Concurrency Test (No Double-Booking)
Goal: prove two concurrent booking attempts for the same slot do not both succeed.

Outline:
1) Seed a tenant, one staff, one service (duration=30 min)
2) Choose a start time
3) Fire N=10 parallel POST /public/:sub/appointments with the same {serviceId, staffId, start}
4) Expect exactly 1 success, others 409

Tips:
- Use a small script (Node or k6). Ensure each request sets a unique Idempotency-Key
- Inspect DB to confirm only one active appointment exists for that window

### Pending Payment TTL (if used by tenant)
1) Create booking with external_required mode
2) Do not call mark-paid
3) Wait > TTL (e.g., 15 min) or reduce TTL in dev
4) Verify status becomes cancelled and slot is free

### Load Tests (Targets: p95 < 300ms for reads, >90% cache hit)
Endpoints:
- GET /public/:sub/availability (heavy read)
- GET /public/:sub/services

Approach:
- Warm cache, then run sustained load at expected RPS (e.g., k6, Locust)
- Measure p95, CPU, and cache hit/miss counters (/metrics)

### Security Checks
- Rate limits trigger on repeated booking attempts per email/phone
- Honeypot causes 400 if present
- HMAC callback rejects with 401 on bad signature

