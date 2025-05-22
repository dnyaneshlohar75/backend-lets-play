import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

db.$connect()
  .then(() => console.log("[INFO] Database connected"))
  .catch((error: any) => console.error("[ERROR] Database connection failed:", error?.message));

export default db;
