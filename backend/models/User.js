// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';

export const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    primaryKey: true, 
    autoIncrement: true 
  },
  
  // USERNAME doit être unique
  username: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  
  // NOM (pas unique)
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  // PRÉNOM (pas unique)
  lastName: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  // EMAIL doit être unique
  email: { 
    type: DataTypes.STRING(200), 
    allowNull: false, 
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  // MOT DE PASSE HASHÉ
  passwordHash: { 
    type: DataTypes.STRING(255), // 255 pour bcrypt
    allowNull: false 
  },
  
  // ADMIN
  is_admin: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: false
  }
}, { 
  tableName: 'users',
  timestamps: true, // Ajoute createdAt et updatedAt
  underscored: false // Utilise camelCase pour les timestamps
});