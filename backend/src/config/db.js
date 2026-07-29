const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

/**
 * Connects to MongoDB.
 * - In production/normal dev: connects to Atlas (or any Mongo URI) via MONGODB_URI.
 * - If USE_MEMORY_DB=true: spins up an in-memory MongoDB instance for local
 *   development/testing without requiring an Atlas connection. This branch is
 *   only ever used when the flag is explicitly set and never in production.
 */
const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    if (env.USE_MEMORY_DB) {
      // eslint-disable-next-line global-require
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      // eslint-disable-next-line no-console
      console.log('[db] Using in-memory MongoDB instance for local development');
    }

    if (!uri) {
      throw new Error(
        'MONGODB_URI is not set. Please provide a MongoDB Atlas connection string in your .env file.'
      );
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
});

    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.warn('[db] MongoDB disconnected');
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[db] Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
