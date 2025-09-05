## Booking Flow (Public)

This document explains how a public booking is created safely without double-booking, including idempotency and notifications.

### Sequence

```mermaid
sequenceDiagram
  participant UI as Public UI
  participant API as Fastify API
  participant Redis as Redis
  participant DB as Postgres
  participant Q as BullMQ
  participant W as Worker

  UI->>API: POST /public/:sub/appointments (serviceId, staffId?, start, customer, idempotencyKey)
  API->>Redis: SET hold:tenant:staff:start:end NX PX=10m
  Redis-->>API: OK | null
  alt Hold acquired
    API->>DB: Transaction: insert appointment (with buffers in start/end)
    API-->>UI: 200 { appointmentId, status, payment }
    opt payment mode = external_required
      API->>Q: enqueue payment-expiry (delay=TTL)
      API->>Q: enqueue pending payment email
    else confirmed immediately
      API->>Q: enqueue confirmation email
    end
  else Hold missing
    API-->>UI: 409 Slot already held
  end
  W->>DB: On expiry job: set status=cancelled if still pending_payment
```

### Guarantees
- Application-level: Redis hold prevents concurrent attempts on same slot.
- Database-level: Exclusion constraint blocks overlaps for `pending_payment` and `confirmed`.
- Idempotency: The API respects the `Idempotency-Key` header to prevent duplicate processing by caching result (see `core-domain/idempotency.ts`).

### Error Handling
- 409 Conflict for overlapped/held slots
- 400 for invalid input (zod)
- 429 for rate-limited identities (email/phone)
- 5xx with `X-Request-Id` and structured logs

