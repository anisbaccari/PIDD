
// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  lastName: { type: DataTypes.STRING(100), allowNull: false },
  address: { type: DataTypes.STRING(100), allowNull: true },
  email: { type: DataTypes.STRING(200), allowNull: false },
  passwordHash: { type: DataTypes.STRING(200), allowNull: false },
  is_admin: { type: DataTypes.BOOLEAN, allowNull: false }
}, { tableName: 'users' });

