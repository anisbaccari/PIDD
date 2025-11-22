
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './mysql.js';
import bcrypt from 'bcryptjs';
import '../models/User.js';
import '../models/Admin.js';
import '../models/Product.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';

import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
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
  { username: 'Anis',name: 'Anis',lastName: 'b', email: 'Anis@example.com', password: 'Anis',isAdmin:true },
  { username: 'Hermann',name: 'Hermann',lastName: 's', email: 'Hermann@example.com', password: 'Hermann',isAdmin:true },
  { username: 'Franklin',name: 'Franklin',lastName: 'x', email: 'Franklin@example.com', password: 'Franklin' ,isAdmin:true},

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
 
  try {
     await ensureDatabase();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

   // Hash passwords for all admins
  for (const admin of adminList) {
    admin.passwordHash = await bcrypt.hash(admin.password, 10);
    delete admin.password; // Remove plain password
  }

  
  // Bulk create admins
  const users = await User.bulkCreate(adminList, { ignoreDuplicates: true });
 
  // Bulk create products
  const prodRepsonse =  await Product.bulkCreate(productList, { ignoreDuplicates: true });
  
  // Order => Commande => Panier = toutes les commandes
  const orderList = [
    { userId:users[0].id, totalPrice: 32, status: 'paid' },
    { userId: users[0].id, totalPrice: 32, status: 'pending' },
    { userId: users[1].id, totalPrice: 32, status: 'pending' }
  ];
  // Bulk create Order/Commande
  const orderResponse = await Order.bulkCreate(orderList, { ignoreDuplicates: true });

  // OrderItems => un produit commandee => plusieurs produits commandés = une Commande
  const orderItemList = [
    { orderId: orderResponse[0].id, quantity: 1, unitPrice: 32 ,productId : prodRepsonse[0].id},
    { orderId:  orderResponse[0].id, quantity: 1, unitPrice: 32 ,productId : prodRepsonse[1].id},
    { orderId: orderResponse[1].id, quantity: 1, unitPrice: 32 ,productId : prodRepsonse[2].id}
  ];

  // Bulk create OrderItem/Produit commandee
  const orderItemResponse = await OrderItem.bulkCreate(orderItemList, { ignoreDuplicates: true });

  console.log('[INITDB] orderResponse (orders plain):', orderResponse.map(o => o.get({ plain: true })));
  console.log('[INITDB] orderItemResponse (order items plain):', orderItemResponse.map(o => o.get({ plain: true })));


  console.log('======================DATABASE======================');

  console.log('Seed done',adminList);
  } catch (error) {
  console.log('[INITDB] ERROR ',error);
    
  }

};
