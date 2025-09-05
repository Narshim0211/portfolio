### Frontend UI Architecture

- Framework: Next.js App Router (React 18), Tailwind CSS, React Query (planned), react-hook-form + zod.
- Accessibility: semantic elements, labels, keyboard-friendly controls. Use shadcn/ui components in production.
- Pages:
  - /admin: landing
  - /admin/settings: branding + payments forms
  - /admin/services: services CRUD manager
  - /admin/staff: staff CRUD + availability editor (RRULE + PTO)
  - /admin/calendar: day view with statuses and move action
- Config: NEXT_PUBLIC_API_BASE points to API; no secrets exposed in the frontend.

