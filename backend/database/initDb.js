// database/initDb.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './mysql.js';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';

dotenv.config();

/* PATH TO IMG */
const noirImg = 'noir.png';
const blancImg = 'blanc.png';
const rosefemmeImg = 'rosefemme.png';
const blancfemmeImg = 'blancfemme.png';
const noirfemmeImg = 'noirfemme.png';
const enfantbleuImg = 'enfantbleu.png';
const enfantrougeImg = 'enfantrouge.png';
const grisImg = 'gris.png';

// ✅ CORRECTION : Ne pas supprimer la BDD à chaque fois
async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  // ⚠️ ATTENTION : Commenté pour ne pas perdre les données
  // await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
  
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  await connection.end();
  console.log('✅ DATABASE vérifiée/créée:', process.env.DB_NAME);
}

const adminList = [
  { username: 'Anis', name: 'Anis', lastName: 's', email: 'Anis@example.com', password: 'Anis', is_admin: true },
  { username: 'Test', name: 'Test', lastName: 'b', email: 'Test@example.com', password: 'Test', is_admin: false },
  { username: 'Hermann', name: 'Hermann', lastName: 'Tchuente', email: 'Hermann@example.com', password: 'Hermann', is_admin: true },
  { username: 'Franklin', name: 'Franklin', lastName: 'x', email: 'Franklin@example.com', password: 'Franklin', is_admin: true },
];

// categories => Homme = 1 | Femme = 2 | Enfant = 3
const productList = [
  // Produits Homme
  { name: "T-shirt Noir Classique", category: 1, price: 20, stock: 30, description: 'Cotton classic tee', img: noirImg, brand: 'Classic' },
  { name: "T-shirt Blanc Sport", category: 1, price: 25, stock: 40, description: 'Cotton classic tee', img: blancImg, brand: 'Sport' },
  { name: "T-shirt Gris Urban", category: 1, price: 23, stock: 50, description: 'Cotton classic tee', img: grisImg, brand: 'Urban' },
  
  // Produits Femme
  { name: "T-shirt Rose Élégant", category: 2, price: 22, stock: 30, description: 'Cotton classic tee', img: rosefemmeImg, brand: 'Elegant' },
  { name: "T-shirt Blanc Femme", category: 2, price: 18, stock: 30, description: 'Cotton classic tee', img: blancfemmeImg, brand: 'Classic' },
  { name: "T-shirt Noir Femme", category: 2, price: 21, stock: 30, description: 'Cotton classic tee', img: noirfemmeImg, brand: 'Classic' },
  
  // Produits Enfants
  { name: "T-shirt Bleu Enfant", category: 3, price: 15, stock: 30, description: 'Cool kid', img: enfantbleuImg, brand: 'Kids' },
  { name: "T-shirt Rouge Enfant", category: 3, price: 16, stock: 30, description: 'Cool kid', img: enfantrougeImg, brand: 'Kids' }
];

export const initDatabase = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    await ensureDatabase();
    await sequelize.authenticate();
    console.log('✅ Connexion à la BDD établie');
    
    // ✅ Synchroniser les modèles (créer les tables si elles n'existent pas)
    await sequelize.sync({ alter: false }); // alter: false pour ne pas modifier les tables existantes
    console.log('✅ Tables synchronisées');

    // Vérifier si des utilisateurs existent déjà
    const userCount = await User.count();
    console.log(`📊 Utilisateurs existants: ${userCount}`);

    if (userCount === 0) {
      console.log('👤 Création des utilisateurs par défaut...');
      
      // Hash passwords for all admins
      for (const admin of adminList) {
        admin.passwordHash = await bcrypt.hash(admin.password, 10);
        delete admin.password;
      }

      // Bulk create users
      const users = await User.bulkCreate(adminList);
      console.log(`✅ ${users.length} utilisateurs créés`);
    } else {
      console.log('⏭️ Utilisateurs déjà existants, création ignorée');
    }

    // Vérifier si des produits existent déjà
    const productCount = await Product.count();
    console.log(`📦 Produits existants: ${productCount}`);

    if (productCount === 0) {
      console.log('📦 Création des produits par défaut...');
      const products = await Product.bulkCreate(productList);
      console.log(`✅ ${products.length} produits créés`);
    } else {
      console.log('⏭️ Produits déjà existants, création ignorée');
    }

    console.log('==============================================');
    console.log('✅ Base de données initialisée avec succès');
    console.log('==============================================');

  } catch (error) {
    console.error('❌ [INITDB] ERROR:', error);
    throw error;
  }
};

// ✅ Script pour RESET complet (à utiliser avec prudence)
export const resetDatabase = async () => {
  try {
    console.log('⚠️ RESET COMPLET DE LA BASE DE DONNÉES...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
    
    console.log('✅ Base de données réinitialisée');
    
    // Réinitialiser avec les données par défaut
    await initDatabase();
    
  } catch (error) {
    console.error('❌ Erreur lors du reset:', error);
    throw error;
  }
};