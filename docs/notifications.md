### Notifications

Components:
- `packages/notifications`: email templates (HTML) and sender interface (console stub)
- `packages/messaging`: BullMQ `email` queue types and helpers
- `apps/worker`: consumes `email` queue and sends emails via the sender

Flow:
1) Booking created
   - If `confirmation_only` or `in_person`: enqueue confirmation email
   - If `external_required`: enqueue pending payment email and payment-expiry delayed job
2) Mark paid callback (HMAC-verified)
   - Update appointment to `confirmed` + `paid`
   - Enqueue confirmation email

Notes:
- Replace `sendEmail` implementation to integrate a provider (Postmark/SendGrid). Keep secrets on server.
- Retry policies can be configured in BullMQ worker; failed jobs go to DLQ (to be added).

