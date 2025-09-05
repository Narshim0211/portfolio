# Data Access (Prisma)

Contains Prisma schema and client factory.

## Migrations
- Initial exclusion constraint SQL is in `prisma/migrations/0001_exclusion_constraint/migration.sql`.
- Apply migrations against a real Postgres instance before production.

## Generate Client
```
npm --workspace packages/data-access run generate
```