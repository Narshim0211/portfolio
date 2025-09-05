## API Reference (v1)

All endpoints are JSON. Validation via zod schemas in `packages/contracts`.

### Public Endpoints

- GET /public/:subdomain/services
  - Response: `ListServicesResponse`

- GET /public/:subdomain/availability?serviceId=&staffId=&date=YYYY-MM-DD
  - Query: `AvailabilityQuery`
  - Response: `AvailabilityResponse`

- POST /public/:subdomain/appointments
  - Body: `CreateAppointmentBody` (includes idempotencyKey and honeypot `hp`)
  - Response: `CreateAppointmentResponse`

- GET /public/:subdomain/appointments/:id
  - Response: `PublicAppointmentResponse`

- POST /public/:subdomain/appointments/:id/mark-paid
  - Headers: `X-Owner-Signature: sha256=<hex>`
  - Body: arbitrary (HMAC signed)

### Admin Endpoints (temporary header `x-tenant-id` until auth)

- GET /admin/settings
  - Response: `AdminSettingsResponse`
- PUT /admin/settings/branding
  - Body: `BrandingSettingsSchema`
- PUT /admin/settings/payments
  - Body: `PaymentSettingsSchema`

- GET /admin/services
  - Response: `AdminServicesResponse`
- POST /admin/services
  - Body: `CreateServiceBody`
- PUT /admin/services/:id
  - Body: `UpdateServiceBody`

- GET /admin/staff
  - Response: `AdminStaffResponse`
- POST /admin/staff
  - Body: `CreateStaffBody`
- PUT /admin/staff/:id
  - Body: `UpdateStaffBody`
- PUT /admin/staff/:id/hours
  - Body: `StaffHoursBody`
- POST /admin/staff/:id/timeoff
  - Body: `StaffTimeOffBody`

- GET /admin/calendar?from=&to=&staffId=
  - Query: `AdminCalendarQuery`
  - Response: `AdminCalendarResponse`
- PUT /admin/appointments/:id/move
  - Body: `MoveAppointmentBody`

### Security & Headers

- CORS: strict allowlist via `ALLOWED_ORIGINS`
- Helmet: HSTS, CSP, X-Frame-Options, etc.
- Rate limits: IP-level and per email/phone on public bookings
- HMAC: Owner callback uses per-tenant secret

See `packages/contracts/src/*` for exact field definitions.

