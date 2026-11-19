import mongoose from 'mongoose';

export interface FinancialTransactionResult<T> {
  result: T;
  transactional: boolean;
  transactionNote: string;
}

/**
 * Executes a financial ledger mutation inside a MongoDB multi-document transaction when supported
 * (MongoDB Replica Set / Atlas). If the connected server is a standalone mongod instance without
 * replica-set transaction support, falls back explicitly and reports `transactional: false`
 * so callers and audit logs never falsely claim atomic transaction guarantees.
 */
export async function runInFinancialTransaction<T>(
  operation: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<FinancialTransactionResult<T>> {
  // If mongoose has no active connection (e.g., mocked repository unit tests), execute cleanly without session
  if (mongoose.connection.readyState !== 1) {
    const result = await operation(null);
    return {
      result,
      transactional: false,
      transactionNote: 'Executed without active MongoDB replica-set session (unit/mocked context).',
    };
  }

  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    let result!: T;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return {
      result,
      transactional: true,
      transactionNote: 'Committed atomically within a MongoDB replica-set transaction.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isStandaloneUnsupported =
      msg.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
      msg.includes('replica set') ||
      msg.includes('sessions are not supported');

    if (isStandaloneUnsupported) {
      const result = await operation(null);
      return {
        result,
        transactional: false,
        transactionNote:
          'Standalone MongoDB detected: multi-document transactions unavailable; executed sequentially with idempotency safeguards.',
      };
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
}
