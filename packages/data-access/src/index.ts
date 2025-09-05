import { PrismaClient } from "@prisma/client";

let prismaSingleton: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  return prismaSingleton;
}

export type { Prisma, Appointment, Service, Staff, Tenant, User } from "@prisma/client";

