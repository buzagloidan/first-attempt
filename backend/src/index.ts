import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { treesRoutes } from './routes/trees';
import { actionsRoutes } from './routes/actions';
import { exportRoutes } from './routes/export';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: true, // Allow all origins in development
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(treesRoutes);
fastify.register(actionsRoutes);
fastify.register(exportRoutes);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

