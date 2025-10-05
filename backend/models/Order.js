// models/Order.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';
import { User } from './User.js';

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { type: DataTypes.ENUM('pending','paid','cancelled','fulfilled'), defaultValue: 'pending' }
}, { tableName: 'orders' });

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
