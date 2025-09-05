import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// Use a mock Redis so tests do not require a real Redis server
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ioredis-mock has compatible API for the used methods
import RedisMock from 'ioredis-mock';
import type Redis from 'ioredis';
import { acquireSlotHold, buildHoldKey, releaseSlotHold } from './redisHold';

describe('redisHold', () => {
  let redis: Redis;
  beforeAll(() => {
    redis = new (RedisMock as any)();
  });
  afterAll(async () => {
    await (redis as any).quit?.();
  });

  it('acquires and releases a hold', async () => {
    const key = buildHoldKey({ tenantId: 't', staffId: 's', startIso: '2025-01-01T10:00:00Z', endIso: '2025-01-01T10:30:00Z' });
    await redis.del(key);
    const ok1 = await acquireSlotHold(redis, key, 1000, 'v');
    expect(ok1).toBe(true);
    const ok2 = await acquireSlotHold(redis, key, 1000, 'v');
    expect(ok2).toBe(false);
    await releaseSlotHold(redis, key);
    const ok3 = await acquireSlotHold(redis, key, 1000, 'v');
    expect(ok3).toBe(true);
    await releaseSlotHold(redis, key);
  });
});

