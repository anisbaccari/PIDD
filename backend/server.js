import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import pool from './database/mysql.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';


dotenv.config();

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register routes
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(profileRoutes, { prefix: '/profil' });

// Crée la table users si elle n'existe pas
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log(' Table "users" vérifiée / créée');
} catch (err) {
  console.error('❌ Erreur lors de la création de la table users :', err);
  process.exit(1);
}



// Start server
try {
  await fastify.listen({ port: process.env.PORT || 3000 });
  console.log('Server running at http://localhost:3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
