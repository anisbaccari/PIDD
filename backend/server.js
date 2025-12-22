// backend/server.js
import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import panierRoutes from './routes/panierRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';  // Importez le nouveau fichier ES6
import homeRoute from './routes/homeRoute.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

import {initDatabase} from './database/initDb.js';
import { sequelize } from './database/mysql.js';

// Import models
import './models/User.js';
import './models/Admin.js';
import './models/Product.js';
import './models/Order.js';
import './models/OrderItem.js';

dotenv.config();

const fastify = Fastify({ 
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  }
});

// ========== CONFIGURATION CORS ==========
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400
});

// ========== ENREGISTREMENT DES ROUTES ==========
await fastify.register(homeRoute);
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(userRoutes);
await fastify.register(profileRoutes, { prefix: '/profil' });
await fastify.register(categorieRoutes, { prefix: '/categories' });
await fastify.register(productRoutes, { prefix: '/product' });
await fastify.register(adminRoutes, { prefix: '/admin' });
await fastify.register(cartRoutes, { prefix: '/cart' });
await fastify.register(adminOrderRoutes, { prefix: '/AdminOrders' });// Enregistrez les routes d'orders
await fastify.register(homeRoute, { prefix: '/hello' })

// ========== DÉMARRAGE ==========
// Dans la fonction start(), ajoutez après await fastify.listen():
const PORT = parseInt(process.env.PORT, 10) || 3000;

const start = async () => {
  try {
       await initDatabase();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    // sync all models (create or alter tables to match models)
    await sequelize.sync({ alter: false });
    fastify.log.info('✅ DB synced');

    console.log('\x1b[32m%s\x1b[0m', `✅ Serveur démarré sur http://localhost:${PORT}`);

    console.log('\x1b[36m%s\x1b[0m', '\n📋 📋 📋 TOUTES LES ROUTES DISPONIBLES:');

    fastify.ready(() => {
      console.log(fastify.printRoutes());
    });

    console.log('\x1b[33m%s\x1b[0m', '\n🔍 Routes principales:');
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${PORT}/profil`);
    console.log('\x1b[33m%s\x1b[0m', `   PUT  http://localhost:${PORT}/profil`);
    console.log('\x1b[33m%s\x1b[0m', `   POST http://localhost:${PORT}/auth/login`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${PORT}/product`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${PORT}/categories`);

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erreur démarrage:', err.message);
    process.exit(1);
  }
};

start();
