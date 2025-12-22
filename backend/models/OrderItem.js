// models/OrderItem.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/mysql.js';
import { Order } from './Order.js';
import { Product } from './Product.js';

export const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false } // snapshot of price at purchase
}, { tableName: 'order_items' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });