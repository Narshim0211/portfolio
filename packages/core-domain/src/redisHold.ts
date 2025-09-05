import Redis from "ioredis";

export interface SlotHoldKeyParts {
  tenantId: string;
  staffId: string;
  startIso: string;
  endIso: string;
}

export function buildHoldKey(parts: SlotHoldKeyParts): string {
  const { tenantId, staffId, startIso, endIso } = parts;
  return `hold:${tenantId}:${staffId}:${startIso}:${endIso}`;
}

export async function acquireSlotHold(
  redis: Redis,
  key: string,
  ttlMs: number,
  value: string
): Promise<boolean> {
  const res = await redis.set(key, value, "PX", ttlMs, "NX");
  return res === "OK";
}

export async function releaseSlotHold(redis: Redis, key: string): Promise<void> {
  await redis.del(key);
}

