### Queue & Worker Architecture

Queue library: BullMQ

Queues:
- payment-expiry: delayed job to auto-cancel `pending_payment` appointments that exceeded TTL.

Flow:
1) API creates appointment in `pending_payment` and enqueues a delayed job with TTL seconds.
2) Worker consumes the queue; when the delayed job unlocks, it marks the appointment `cancelled` if still `pending_payment`.
3) Downstream notifications/webhooks (future) can be published on state changes.

Runbook:
- If the worker dies, delayed jobs execute once it restarts. Monitor queue age metrics.
- If Redis is unavailable, API should still create the appointment; retries should enqueue job once Redis returns.

