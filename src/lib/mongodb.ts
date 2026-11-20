import mongoose from 'mongoose';

/**
 * Singleton Mongoose connection cached on globalThis to survive Next.js dev HMR.
 * Automatically clears failed promises on rejection so transient MongoDB outages recover
 * without requiring a Node.js server restart.
 */

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function resetDatabaseConnectionCache(): void {
  global._mongooseConn = undefined;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose
      .connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
      })
      .catch((error: unknown) => {
        // Never poison future requests with a permanently cached rejected promise
        global._mongooseConn = undefined;
        throw error;
      });
  }

  return global._mongooseConn;
}

export default connectToDatabase;
