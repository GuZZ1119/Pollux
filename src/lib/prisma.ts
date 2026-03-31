import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __polluxPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__polluxPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__polluxPrisma = prisma;
}
