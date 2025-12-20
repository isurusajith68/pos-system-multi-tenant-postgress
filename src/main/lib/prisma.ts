import { is } from "@electron-toolkit/utils";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import type { Prisma, PrismaClient } from "../../generated/prisma";

// Global singleton instances - one for public schema, one for tenant schemas
type PrismaClientConstructor = new (options?: Prisma.PrismaClientOptions) => PrismaClient;

let publicPrismaInstance: PrismaClient | null = null;
const tenantPrismaInstances: Map<string, PrismaClient> = new Map();
let activeSchemaName: string | null = null;

export function getPrismaClient(): PrismaClient {
  if (activeSchemaName) {
    return getTenantPrismaClient(activeSchemaName);
  }

  return getPublicPrismaClient();
}

export function setActiveSchema(schemaName: string | null): void {
  const normalizedSchema = typeof schemaName === "string" ? schemaName.trim() : "";
  activeSchemaName = normalizedSchema ? normalizedSchema : null;
}

export function getActiveSchema(): string | null {
  return activeSchemaName;
}

function getPublicPrismaClient(): PrismaClient {
  // Return existing instance if already created
  if (publicPrismaInstance) {
    return publicPrismaInstance;
  }

  try {
    // PostgreSQL connection for public schema - DATABASE_URL should be set in environment
    publicPrismaInstance = createPrismaClient(buildDatabaseUrl());

    return publicPrismaInstance;
  } catch (error) {
    console.error("Failed to initialize public Prisma client:", error);
    throw error;
  }
}

function getTenantPrismaClient(schemaName: string): PrismaClient {
  const normalizedSchema = schemaName.trim();
  const existingClient = tenantPrismaInstances.get(normalizedSchema);
  if (existingClient) {
    return existingClient;
  }

  const tenantClient = createPrismaClient(buildDatabaseUrl(normalizedSchema));
  tenantPrismaInstances.set(normalizedSchema, tenantClient);
  return tenantClient;
}

function buildDatabaseUrl(schemaName?: string): string {
  loadEnvIfNeeded();
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!schemaName) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("schema", schemaName);
  return url.toString();
}

function loadEnvIfNeeded(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

  const candidatePaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), ".env.production"),
    resolve(__dirname, "../../.env"),
    resolve(__dirname, "../../.env.production")
  ];

  for (const envPath of candidatePaths) {
    if (!existsSync(envPath)) {
      continue;
    }

    try {
      const content = readFileSync(envPath, "utf8");
      applyEnvFromFile(content);
      if (process.env.DATABASE_URL) {
        return;
      }
    } catch (error) {
      console.warn(`Failed to load env file at ${envPath}:`, error);
    }
  }
}

function applyEnvFromFile(content: string): void {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_\\.-]*)\\s*=\\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = match[2].trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function createPrismaClient(databaseUrl: string): PrismaClient {
  const PrismaClientCtor = resolvePrismaClientConstructor();
  return new PrismaClientCtor({
    log: ["error", "warn"],
    // Connection pool settings for PostgreSQL
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
}

function resolvePrismaClientConstructor(): PrismaClientConstructor {
  // Always use our generated client instead of @prisma/client
  if (is.dev) {
    // In development, use the generated client from src
    const { PrismaClient: DevClient } = require(join(__dirname, "../../src/generated/prisma"));
    return DevClient;
  }

  // In production, try to find the generated client in the packaged app
  try {
    // Try the generated client path first
    const { PrismaClient: ProdClient } = require(join(__dirname, "../../src/generated/prisma"));
    return ProdClient;
  } catch (error) {
    // Fallback to resources path
    const { PrismaClient: ResourceClient } = require(
      join(process.resourcesPath, "generated", "prisma")
    );
    return ResourceClient;
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

export default getPrismaClient;
