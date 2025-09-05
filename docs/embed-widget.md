## Embeddable Booking Widget

To embed the booking flow on any website:

1) Include the script tag on the page (replace `SUBDOMAIN` and `API_BASE`):
```html
<script src="API_BASE/public/SUBDOMAIN/embed.js" async></script>
```

2) Optionally mount into a specific element:
```html
<div id="booking"></div>
<script>
  window.SalonBookingWidget && window.SalonBookingWidget.mount('#booking');
  // The widget iframe points to /book/service?sub=SUBDOMAIN and adapts brand color.
  // To deep-link a tenant: /book/service?sub=SUBDOMAIN
  // To use full page public booking, link to your web app route directly.
  // Security: The script does not expose secrets; the API enforces CORS and rate limits.
  // Performance: The iframe loads a minimal page with caching for branding and services.
  // Accessibility: The iframe has a title; host page should ensure sufficient contrast.
  // Troubleshooting: See TROUBLESHOOTING.md for common embed issues.
  // CSP: Allow script from API_BASE and frame ancestors as needed.
  //
  // Example:
  // <script src="https://api.yourapp.com/public/acmesalon/embed.js" async></script>
  // window.SalonBookingWidget.mount('#booking');
  //
  // Events: listen to 'message' for { type:'salon:success', appointmentId } and { type:'salon:resize', height }.
  // The widget uses the same public endpoints as the booking UI.
  // You can customize style with CSS around the iframe container.
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
</script>
```

