## Deployment & DR

### Prereqs
- Managed Postgres (Multi-AZ, PITR enabled)
- Managed Redis
- Container runtime (ECS/Fargate/Fly/Render)
- CDN + WAF in front of API and Web

### Steps
1) Build images for api, web, worker
2) Apply DB migrations (Prisma + manual exclusion constraint SQL)
3) Configure env: see `env-config.md`
4) Deploy API and Worker; verify /healthz and /metrics
5) Deploy Web behind CDN, set `NEXT_PUBLIC_API_BASE`

### DR & Backups
- Postgres PITR: test restore quarterly
- Redis: data loss tolerable (cache/locks); monitor health and failover plan
- Images and IaC stored securely with versioning

### Observability
- Scrape /metrics; alert on: p95>500ms, 5xx>1%, queue age>2m
- Centralized structured logs with requestId

