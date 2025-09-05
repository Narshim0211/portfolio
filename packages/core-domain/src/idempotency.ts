import Redis from "ioredis";

const prefix = "idem:";

export async function getOrSetIdempotent<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<{ fresh: boolean; value: T }> {
  const cacheKey = prefix + key;
  const existing = await redis.get(cacheKey);
  if (existing) {
    return { fresh: false, value: JSON.parse(existing) as T };
  }
  const value = await compute();
  await redis.set(cacheKey, JSON.stringify(value), "EX", ttlSeconds, "NX");
  return { fresh: true, value };
}

