// backend/server.js
import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import panierRoutes from './routes/panierRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; // Importez le nouveau fichier ES6
import homeRoute from './routes/homeRoute.js';

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
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400
});

// ========== ENREGISTREMENT DES ROUTES ==========
await fastify.register(homeRoute);
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(profileRoutes, { prefix: '/profil' });
await fastify.register(categorieRoutes, { prefix: '/categories' });
await fastify.register(productRoutes, { prefix: '/product' });
await fastify.register(panierRoutes, { prefix: '/panier' });
await fastify.register(adminRoutes, { prefix: '/admin' });
await fastify.register(orderRoutes, { prefix: '/api/orders' }); // Enregistrez les routes d'orders
await fastify.register(homeRoute, { prefix: '/hello' })
// ========== HEALTH CHECK ==========
fastify.get('/health', async () => {
  return { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'PIDD API'
  };
});

// ========== API INFO ==========
fastify.get('/api', async () => {
  return {
    name: 'PIDD API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      profile: '/profil',
      products: '/product',
      categories: '/categories',
      cart: '/panier',
      orders: '/api/orders',
      admin: '/admin'
    }
  };
});

// ========== DÉMARRAGE ==========
const start = async () => {
  try {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Initialisation du serveur PIDD...');
    
    await initDatabase();
    console.log('\x1b[32m%s\x1b[0m', '✅ Base de données initialisée');
    
    await sequelize.authenticate();
    console.log('\x1b[32m%s\x1b[0m', '✅ Connexion DB établie');
    
    await sequelize.sync({ alter: true });
    console.log('\x1b[32m%s\x1b[0m', '✅ Modèles synchronisés');
    
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    
    console.log('\x1b[32m%s\x1b[0m', `✅ Serveur démarré sur http://localhost:${port}`);
    console.log('\x1b[36m%s\x1b[0m', '📋 Routes disponibles:');
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${port}/health`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${port}/api`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${port}/admin/dashboard`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${port}/api/orders/admin`);
    console.log('\x1b[33m%s\x1b[0m', `   GET  http://localhost:${port}/api/orders/test`);
    
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erreur démarrage:', err.message);
    process.exit(1);
  }
};

start();