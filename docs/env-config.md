## Environment & Configuration

Backend (.env)

| Key | Description | Default |
| --- | --- | --- |
| POSTGRES_USER | DB user | app |
| POSTGRES_PASSWORD | DB password | app |
| POSTGRES_DB | DB name | salon |
| DATABASE_URL | Postgres connection URL | postgresql://app:app@localhost:5432/salon?schema=public |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| API_PORT | API port | 4000 |
| API_HOST | API bind host | 0.0.0.0 |
| NODE_ENV | Node environment | development |
| ALLOWED_ORIGINS | CORS allowlist | http://localhost:5173,http://localhost:3000 |
| RATE_LIMIT_EMAIL_PER_MIN | Booking per-email limit/min | 5 |
| RATE_LIMIT_PHONE_PER_MIN | Booking per-phone limit/min | 5 |

Frontend (apps/web/.env)

| Key | Description | Default |
| --- | --- | --- |
| NEXT_PUBLIC_API_BASE | API base URL | http://localhost:4000 |
| NEXT_PUBLIC_DEV_TENANT_ID | Dev tenant id for admin | 00000000-0000-0000-0000-000000000000 |
| NEXT_PUBLIC_PUBLIC_SUBDOMAIN | Public booking subdomain | demo |

Worker

| Key | Description | Default |
| --- | --- | --- |
| REDIS_HOST | Worker Redis host | 127.0.0.1 |
| REDIS_PORT | Worker Redis port | 6379 |

