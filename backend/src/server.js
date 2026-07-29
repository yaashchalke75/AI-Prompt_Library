const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const start = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(
        `[server] AI Prompt Library API running on port ${env.PORT} (${env.NODE_ENV})`
      );
    });
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[server] Received ${signal}, shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[server] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.error('[server] Uncaught exception:', error);
  process.exit(1);
});

start();
