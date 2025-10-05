// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(200), allowNull: false },
}, { tableName: 'users' });
