import mongoose from 'mongoose';

/**
 * Singleton Mongoose connection, cached on the global object to survive
 * Next.js dev-mode HMR without exhausting the MongoDB connection pool.
 *
 * Not yet wired into the UI — the site currently runs on the mock dataset in
 * `src/data/mockDatabase.ts` via DatabaseContext (see README for the phased
 * plan to move each domain over to real persistence).
 */

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(uri);
  }

  return global._mongooseConn;
}

export default connectToDatabase;
