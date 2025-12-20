import { is } from "@electron-toolkit/utils";
import { join } from "path";
import type { Prisma, PrismaClient } from "../../generated/prisma";

// Global singleton instances - one for public schema, one for tenant schemas
type PrismaClientConstructor = new (options?: Prisma.PrismaClientOptions) => PrismaClient;

let publicPrismaInstance: PrismaClient | null = null;
const tenantPrismaInstances: Map<string, PrismaClient> = new Map();

export function getPrismaClient(schemaName?: string): PrismaClient {
  // If no schema specified, return public schema client
  if (!schemaName) {
    return getPublicPrismaClient();
  }

  // Return tenant-specific client
  return getTenantPrismaClient(schemaName);
}

function getPublicPrismaClient(): PrismaClient {
  // Return existing instance if already created
  if (publicPrismaInstance) {
    return publicPrismaInstance;
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

    // PostgreSQL connection for public schema - DATABASE_URL should be set in environment
    publicPrismaInstance = new PrismaClientCtor({
      log: ["error", "warn"],
      // Connection pool settings for PostgreSQL
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    return publicPrismaInstance;
  } catch (error) {
    console.error("Failed to initialize public Prisma client:", error);
    throw error;
  }
}

function getTenantPrismaClient(schemaName: string): PrismaClient {
  // Return existing instance if already created for this schema
  if (tenantPrismaInstances.has(schemaName)) {
    return tenantPrismaInstances.get(schemaName)!;
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

    // Create a new connection with the specified schema
    const databaseUrl = process.env.DATABASE_URL!.replace(/(\w+:\/\/[^/]+).*/, `$1/${schemaName}`);

    const tenantClient = new PrismaClientCtor({
      log: ["error", "warn"],
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    // Store the instance for reuse
    tenantPrismaInstances.set(schemaName, tenantClient);

    return tenantClient;
  } catch (error) {
    console.error(`Failed to initialize Prisma client for schema ${schemaName}:`, error);
    throw error;
  }
}

// Cleanup function for graceful shutdown
export async function disconnectPrismaClients(): Promise<void> {
  const disconnectPromises: Promise<void>[] = [];

  if (publicPrismaInstance) {
    disconnectPromises.push(publicPrismaInstance.$disconnect());
  }

  for (const client of tenantPrismaInstances.values()) {
    disconnectPromises.push(client.$disconnect());
  }

  await Promise.all(disconnectPromises);
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await disconnectPrismaClients();
});

export default getPrismaClient();
