
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './mysql.js';
import bcrypt from 'bcryptjs';
import '../models/User.js';
import '../models/Admin.js';
import '../models/Product.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
dotenv.config();


export async function ensureDatabase(){
  const { DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASS} = process.env;
}

const connection = await mysql.createConnection({
  host:  process.env.DB_HOST || 'localhost',
  port :  process.env.DB_PORT || '3306',
  user :  process.env.DB_USER || 'root',
  password :  process.env.DB_PASS || '',
});


await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
await connection.end();
console.log(' DATABASE created : ',process.env.DB_NAME);


const adminList = [
  { username: 'Anis', email: 'Anis@example.com', password: 'Anis' },
  { username: 'Hermann', email: 'Hermann@example.com', password: 'Hermann' },
  { username: 'Franklin', email: 'Franklin@example.com', password: 'Franklin' },

  // Add more admins as needed
];

const productList = [
  { name: 'Classic T-Shirt', category: 'Homme', price: 19.99, quantity: 50, description: 'Cotton classic tee' },
  { name: 'kid T-Shirt', category: 'Enfant', price: 9.99, quantity: 50, description: 'cool kid ' },
  { name: 'Premium Hoodie', category: 'Femme', price: 39.99, quantity: 30, description: ' brand new' },
  // Add more products as needed
];

export const initDatabase = async () => {
  await ensureDatabase();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

   // Hash passwords for all admins
  for (const admin of adminList) {
    admin.passwordHash = await bcrypt.hash(admin.password, 10);
    delete admin.password; // Remove plain password
  }

  
  // Bulk create admins
  await Admin.bulkCreate(adminList, { ignoreDuplicates: true });

  // Bulk create products
  await Product.bulkCreate(productList, { ignoreDuplicates: true });

  console.log('======================DATABASE======================');

  console.log('Seed done',adminList);

};
