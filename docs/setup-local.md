### Local Development Setup

Prereqs: Node 20+, npm, Postgres 16, Redis 7

1) Copy .env.example → .env and verify DATABASE_URL and REDIS_URL
2) Install deps: `npm install`
3) Generate Prisma client: `npm run db:generate`
4) (Optional) Apply migrations when DB is available: `npm --workspace packages/data-access run migrate:apply`
5) Start API: `npm run dev:api`

If Docker is available, run `docker compose up -d postgres redis`.

