# Core Domain

This package contains pure domain utilities used by the API:
- availability.ts: generates per-day time slots, respects buffers and existing appointments
- redisHold.ts: acquires/releases Redis holds to avoid concurrent double booking
- idempotency.ts: caches results by key to handle client retries safely

## Tests

Run Vitest at repo root:
```
npm run test
```

Redis is mocked via ioredis-mock for the unit test.