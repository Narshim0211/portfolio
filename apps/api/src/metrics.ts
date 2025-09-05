import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const availabilityCacheHits = new client.Counter({
  name: 'availability_cache_hits_total',
  help: 'Availability cache hits',
  labelNames: ['tenant'] as const,
  registers: [registry],
});

export const availabilityCacheMisses = new client.Counter({
  name: 'availability_cache_misses_total',
  help: 'Availability cache misses',
  labelNames: ['tenant'] as const,
  registers: [registry],
});

export const bookingAttempts = new client.Counter({
  name: 'booking_attempts_total',
  help: 'Booking attempts',
  labelNames: ['tenant'] as const,
  registers: [registry],
});

export const bookingRateLimited = new client.Counter({
  name: 'booking_rate_limited_total',
  help: 'Bookings blocked by per-identity rate limit',
  labelNames: ['tenant', 'dimension'] as const,
  registers: [registry],
});

export const bookingHoneypot = new client.Counter({
  name: 'booking_honeypot_block_total',
  help: 'Bookings blocked by honeypot',
  labelNames: ['tenant'] as const,
  registers: [registry],
});

