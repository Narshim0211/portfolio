### Runbooks

API 5xx spike
- Check /healthz and logs; inspect recent deploys.
- Look for DB connectivity issues; roll back if needed.

Queue backlog
- Inspect BullMQ queue depth; scale workers; identify stuck jobs.

DB failover
- Confirm managed Postgres failover; ensure app reconnects; monitor error rate.

Email provider outage
- Switch to backup provider or queue notifications until restored.

Cache down
- Expect slower availability; ensure app degrades gracefully; investigate Redis.

