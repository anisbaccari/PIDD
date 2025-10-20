// models/Product.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';


export const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  category: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // e.g., "T-Shirt"
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  img: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'products' });
