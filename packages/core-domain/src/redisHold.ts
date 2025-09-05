import Redis from "ioredis";

/**
 * Utilities for acquiring and releasing short-lived Redis slot holds to prevent
 * concurrent double-booking at the application layer. The database will also
 * enforce non-overlap via an exclusion constraint for defense in depth.
 */

export interface SlotHoldKeyParts {
  tenantId: string;
  staffId: string;
  startIso: string;
  endIso: string;
}

/**
 * Build a stable Redis key for a slot hold.
 */
export function buildHoldKey(parts: SlotHoldKeyParts): string {
  const { tenantId, staffId, startIso, endIso } = parts;
  return `hold:${tenantId}:${staffId}:${startIso}:${endIso}`;
}

/**
 * Attempt to acquire a hold using SET NX PX.
 * Returns true if acquired; false if key already exists.
 */
export async function acquireSlotHold(
  redis: Redis,
  key: string,
  ttlMs: number,
  value: string
): Promise<boolean> {
  const res = await redis.set(key, value, "PX", ttlMs, "NX");
  return res === "OK";
}

/**
 * Release a previously acquired hold.
 */
export async function releaseSlotHold(redis: Redis, key: string): Promise<void> {
  await redis.del(key);
}

