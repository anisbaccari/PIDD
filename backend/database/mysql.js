import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();


export const sequelize = new Sequelize(
    process.env.DB_NAME || 'myappdb',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      dialect: 'mysql',
      logging: true,
      pool: { max:10,min: 0,idle : 10000},
    });
