
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


export async function ensureDatabase(){
  const { DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASS} = process.env;
}

const connection = await mysql.createConnection({
  host: DB_HOST || 'localhost',
  port : DB_PORT || '3306',
  user : DB_USER || 'root',
  password : DB_PASS || '',
});

await connection.query(` CREATE DATABASE IF NOT EXIST \`${DB_NAME}`);
await connection.end();
console.log(' DATABASE created : ',DB_NAME);