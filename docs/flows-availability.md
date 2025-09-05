## Availability Flow

### Read Path
- UI calls `GET /public/:subdomain/availability?serviceId&staffId&date`
- API checks Redis cache `avail:{tenant}:{service}:{staff?}:{date}:{tz}`
- On cache miss: generate slots for the day using `core-domain/availability.ts`, then cache for 10 minutes

### Cache Invalidation
- After a successful booking, the API deletes the key for the affected `{tenant, service, staff, date}`

### Performance Targets
- p95 < 300ms with >90% cache hit rate

