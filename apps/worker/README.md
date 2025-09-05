# Worker

Consumes BullMQ queues:
- payment-expiry: cancels `pending_payment` appointments after TTL
- email: sends emails via notifications sender

## Run
```
npm --workspace apps/worker run dev
```

Env: `REDIS_HOST`, `REDIS_PORT` (see `../../docs/env-config.md`).