import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';
import { User } from './User.js';

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderNumber: { 
    type: DataTypes.STRING(50), 
    unique: true,
    allowNull: false,
    defaultValue: () => `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { 
    type: DataTypes.ENUM('pending','confirmed','processing','shipped','delivered','cancelled'), 
    defaultValue: 'pending' 
  },
  paymentMethod: { type: DataTypes.STRING(50), allowNull: false },
  paymentStatus: { 
    type: DataTypes.ENUM('pending','paid','failed','refunded'), 
    defaultValue: 'pending' 
  },
  shippingAddress: { type: DataTypes.JSON, allowNull: false },
  shippingMethod: { type: DataTypes.STRING(100) },
  trackingNumber: { type: DataTypes.STRING(100) },
  notes: { type: DataTypes.TEXT },
  estimatedDelivery: { type: DataTypes.DATE }
}, { 
  tableName: 'orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });