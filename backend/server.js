// server.js
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';

// Routes
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import homeRoute from './routes/homeRoute.js';
import panierRoutes from './routes/panierRoutes.js';
import productRoutes from './routes/productRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Database
import { initDatabase } from './database/initDb.js';
import { sequelize } from './database/mysql.js';

// Models (pour les associations)
import './models/Admin.js';
import './models/Order.js';
import './models/OrderItem.js';
import './models/Product.js';
import './models/User.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// --------------------
// Middleware CORS
// --------------------
await fastify.register(cors, {
  origin: '*', // À changer en production pour ton frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
});

// --------------------
// Routes
// --------------------
await fastify.register(homeRoute);
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(profileRoutes, { prefix: '/profil' });
await fastify.register(categorieRoutes, { prefix: '/categories' });
await fastify.register(productRoutes, { prefix: '/product' });
await fastify.register(panierRoutes, { prefix: '/panier' });
await fastify.register(adminRoutes, { prefix: '/admin' });

// --------------------
// Démarrage serveur
// --------------------
const start = async () => {
  try {
    await initDatabase();            // Initialise la base si besoin
    await sequelize.authenticate();  // Vérifie la connexion
    await sequelize.sync({ alter: true }); // Sync tables
    fastify.log.info('✅ DB synced');

    await fastify.listen({ port: process.env.PORT || 3000 });
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
