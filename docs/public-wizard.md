### Public Booking Wizard

Steps:
1) /book/service — lists services via GET /public/:subdomain/services
2) /book/time — shows availability via GET /public/:subdomain/availability
3) /book/details — collects customer info and policy consent
4) /book/review — POST /public/:subdomain/appointments with Idempotency-Key
5) /book/pay — if external_required, redirect/open payment link and poll GET /public/:subdomain/appointments/:id
6) /book/success — confirmation + ICS download

Security:
- No secrets in frontend; subdomain provided through public env.
- API validates inputs with zod, enforces rate limits and CORS.
- Duplicate click protection via Idempotency-Key.

