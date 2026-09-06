import { prisma } from '../database/client';

/**
 * Generic Base Repository providing standard multi-tenant scoped CRUD operations.
 */
export abstract class BaseRepository<T> {
  protected db = prisma;
  protected abstract modelName: string;

  /**
   * Helper to ensure all tenant queries are scoped by organizationId.
   */
  protected withTenantScope(organizationId: string, filter: Record<string, unknown> = {}) {
    return {
      ...filter,
      organizationId,
    };
  }
}
