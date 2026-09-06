import { prisma } from '../database/client';

export { prisma };

/**
 * Standard utility for safe transaction handling across multi-tenant operations.
 */
export async function withTenantTransaction<T>(
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  // Direct callback execution with transaction boundary
  return await prisma.$transaction(async (tx) => {
    return await callback(tx as typeof prisma);
  });
}

/**
 * Health check utility for the database connection.
 */
export async function checkDatabaseHealth(): Promise<{ isHealthy: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    // Ping PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    return {
      isHealthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      error: message,
    };
  }
}
