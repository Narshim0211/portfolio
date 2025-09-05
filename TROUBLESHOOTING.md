## Troubleshooting

### API won't start
- Ensure `DATABASE_URL` and `REDIS_URL` are set and reachable.
- Check port conflicts on `API_PORT`.

### Booking returns 409 (slot held)
- Another client may have acquired a Redis hold.
- Try another time slot; holds expire in ~10 minutes.

### Mark-paid callback fails (401)
- Verify `X-Owner-Signature` is computed with the correct per-tenant secret.
- Ensure the raw body is unmodified and sent exactly as signed.

### Availability shows no slots
- Confirm staff exists, is active, and there are no PTO overlaps.
- Check service duration and buffers; too long durations reduce options.

### Emails not sending
- Worker must be running; inspect worker logs.
- For now, the sender is a console stub; integrate a real provider.

