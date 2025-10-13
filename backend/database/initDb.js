
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


/* PATH TO IMG  */
const noirImg = 'noir.png'
const blancImg = 'blanc.png'
const rosefemmeImg = 'rosefemme.png'
const blancfemmeImg = 'blancfemme.png'
const noirfemmeImg = 'noirfemme.png'
const enfantbleuImg = 'enfantbleu.png'
const enfantrougeImg = 'enfantrouge.png'
const grisImg = 'gris.png'

/* ==== */

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



// categories  => Homme  = 1  | Femme = 2 | Enfant = 3
const productList = [

    // Produits Homme
        { name: "T-shirt Noir Classique",category: 1, price: 20,quantity: 30, description: 'Cotton classic tee' ,img : noirImg },
        { name: "T-shirt Blanc Sport",category: 1, price: 25,quantity: 50, description: 'Cotton classic tee' ,img : blancImg},
        { name: "T-shirt Gris Urban",category: 1, price: 23,quantity: 50, description: 'Cotton classic tee' ,img : grisImg},
        
        // Produits Femme
        { name: "T-shirt Rose Élégant", category: 2,price: 22, description: 'Cotton classic tee' ,img : rosefemmeImg},
        { name: "T-shirt Blanc Femme", category: 2,price: 24, description: 'Cotton classic tee' ,img : blancfemmeImg},
        { name: "T-shirt Noir Femme", category: 2,price: 21, description: 'Cotton classic tee' ,img : noirfemmeImg},
        
        // Produits Enfants
        { name: "T-shirt Bleu Enfant", category: 3, price: 15, description: 'Cool kid' ,img : enfantbleuImg },
        { name: "T-shirt Rouge Enfant", category: 3, price: 16, description: 'Cool kid' ,img : enfantrougeImg}
      
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
