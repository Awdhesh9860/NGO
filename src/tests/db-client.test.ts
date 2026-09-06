import { assert } from './setup';
import { prisma } from '../database/client';

export function runDatabaseTests(): { passed: number; failed: number; results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> } {
  const results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ test: name, status: 'PASS' });
      passed++;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ test: name, status: 'FAIL', error: errorMsg });
      failed++;
    }
  };

  test('Prisma client singleton is initialized and accessible', () => {
    assert(prisma !== undefined && prisma !== null, 'Prisma singleton is undefined');
    assert(typeof prisma.$connect === 'function', 'Prisma.$connect method is missing');
  });

  return { passed, failed, results };
}
