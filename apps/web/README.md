# Web (Next.js)

Admin dashboard and public booking wizard.

## Run
```
npm --workspace apps/web run dev
```

Env vars: see `../web/.env.example` and `../../docs/env-config.md`.

## Structure
- app/admin/*: admin pages (calendar, services, staff, settings)
- app/book/*: public wizard (service, time, details, review, pay, success)
- app/providers.tsx: React Query defaults
- components/ui/ToastProvider.tsx: toast notifications

## UX Patterns
- Skeleton loaders on service/time
- Suspense wrappers for search params pages
- Stepper on booking pages