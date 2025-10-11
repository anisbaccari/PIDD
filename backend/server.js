import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import productRoutes from './routes/productRoutes.js';

import homeRoute from './routes/homeRoute.js';

import {initDatabase} from './database/initDb.js';
import { sequelize } from './database/mysql.js';
// import models (to register them & associations)
 //Doing this execute the file as each ifle import been executeed
import './models/User.js';
import './models/Admin.js';
import './models/Product.js';
import './models/Order.js';
import './models/OrderItem.js';


import { User } from './models/User.js';
import { Admin } from './models/Admin.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { OrderItem } from './models/OrderItem.js';

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
await fastify.register(productRoutes, { prefix: '/product' });





// Start server

const start = async () =>{
  try {

    await initDatabase();
 

    await sequelize.authenticate();
    // sync all models (create or alter tables to match models)
    await sequelize.sync({ alter: true });
    fastify.log.info('✅ DB synced');
    await fastify.listen({ port: process.env.PORT || 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
