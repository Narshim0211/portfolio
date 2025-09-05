## CAPTCHA & Embed Integration

### CAPTCHA (optional)
- Enable via env: `CAPTCHA_ENABLED=true`, set `CAPTCHA_PROVIDER` and `CAPTCHA_SECRET` accordingly.
- Frontend: Include a `captchaToken` field in `CreateAppointmentBody`.
- Backend: Verifies token (provider integration placeholder is present; add HTTP verification call to vendor API).
- Failure: API returns 400 `CAPTCHA verification failed`.

### Embed Auto-resize & Events
- Script: `GET /public/:subdomain/embed.js` injects an iframe pointing to `/book/service?sub={sub}`.
- Communication: The booking pages post height via `window.postMessage({ type: 'salon:resize', height })`.
- Host page: The script listens to messages and sets the iframe height.
- You can mount the widget into a specific container using `window.SalonBookingWidget.mount('#selector')`.

