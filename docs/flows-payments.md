## Payments Flow (External)

### Modes
- confirmation_only: confirm immediately, mark paid
- in_person: confirm immediately, unpaid
- external_required: pending_payment until signed callback

### Sequence (external_required)
1) API responds with `pending_payment` and external URL with `?apt={id}&amt={price}`
2) UI redirects user to external payment page
3) Owner site calls `POST /public/:sub/appointments/:id/mark-paid` with HMAC header
4) API verifies HMAC with tenant secret, updates appointment to `confirmed` + `paid`, enqueues confirmation email
5) If TTL expires before callback, worker cancels the appointment and frees the slot

### Security
- Only accept mark-paid with valid `X-Owner-Signature: sha256=<hex>` header
- Rate limit callbacks per IP and route (configured via Fastify rate-limit)

