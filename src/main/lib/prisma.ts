import { is } from "@electron-toolkit/utils";
import { join } from "path";
import type { Prisma, PrismaClient } from "../../generated/prisma";

// Global singleton instance
type PrismaClientConstructor = new (options?: Prisma.PrismaClientOptions) => PrismaClient;

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  // Return existing instance if already created
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    // Always use our generated client instead of @prisma/client
    let PrismaClientCtor: PrismaClientConstructor;

    if (is.dev) {
      // In development, use the generated client from src
      const { PrismaClient: DevClient } = require(join(__dirname, "../../src/generated/prisma"));
      PrismaClientCtor = DevClient;
    } else {
      // In production, try to find the generated client in the packaged app
      try {
        // Try the generated client path first
        const { PrismaClient: ProdClient } = require(join(__dirname, "../../src/generated/prisma"));
        PrismaClientCtor = ProdClient;
      } catch (error) {
        // Fallback to resources path
        const { PrismaClient: ResourceClient } = require(
          join(process.resourcesPath, "generated", "prisma")
        );
        PrismaClientCtor = ResourceClient;
      }
    }

    // PostgreSQL connection - DATABASE_URL should be set in environment
    prismaInstance = new PrismaClientCtor({
      log: ["error", "warn"],
      // Connection pool settings for PostgreSQL
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Handle graceful shutdown
    process.on("beforeExit", async () => {
      if (prismaInstance) {
        await prismaInstance.$disconnect();
      }
    });

    return prismaInstance;
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error;
  }
}

export default getPrismaClient();
