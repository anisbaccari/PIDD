import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import homeRoute from './routes/homeRoute.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']

});

// Register routes
await fastify.register(homeRoute);
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(profileRoutes, { prefix: '/profil' });

// Start server
try {
  await fastify.listen({ port: process.env.PORT || 3000 });
  console.log('Server running at http://localhost:3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
