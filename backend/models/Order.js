//order model definition
import { DataTypes } from 'sequelize'
import { sequelize } from '../database/mysql.js'
import { User } from './User.js'

export const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'orders'
  }
)

// 🔗 Relations
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
})

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
})
