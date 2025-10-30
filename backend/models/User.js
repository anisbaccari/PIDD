// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: true },
  prenom: { type: DataTypes.STRING(100), allowNull: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(200), allowNull: false },
}, { tableName: 'users' });

