import { is } from "@electron-toolkit/utils";
import { join } from "path";

// Global singleton instance
let prismaInstance: unknown = null;

export function getPrismaClient(): unknown {
  // Return existing instance if already created
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    // Always use our generated client instead of @prisma/client
    let PrismaClient: any;

    if (is.dev) {
      // In development, use the generated client from src
      const { PrismaClient: DevClient } = require(join(__dirname, "../../src/generated/prisma"));
      PrismaClient = DevClient;
    } else {
      // In production, try to find the generated client in the packaged app
      try {
        // Try the generated client path first
        const { PrismaClient: ProdClient } = require(join(__dirname, "../../src/generated/prisma"));
        PrismaClient = ProdClient;
      } catch (error) {
        // Fallback to resources path
        const { PrismaClient: ResourceClient } = require(
          join(process.resourcesPath, "generated", "prisma")
        );
        PrismaClient = ResourceClient;
      }
    }

    // PostgreSQL connection - DATABASE_URL should be set in environment
    prismaInstance = new PrismaClient({
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
        await (prismaInstance as any).$disconnect();
      }
    });

    return prismaInstance;
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error;
  }
}

export default getPrismaClient();
