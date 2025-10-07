
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


export async function ensureDatabase(){
  const { DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASS} = process.env;
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port : process.env.DB_PORT || '3306',
  user : process.env.DB_USER || 'root',
  password : process.env.DB_PASS || '',
});

await connection.query(` CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` ;`);
await connection.end();
console.log(' DATABASE created : ',process.env.DB_NAME);