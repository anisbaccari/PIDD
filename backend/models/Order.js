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

    // 🔑 FK utilisateur (OBLIGATOIRE)
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    // 💰 Total de la commande
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    // 📦 Statut commande
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'fulfilled'),
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
  onDelete: 'CASCADE',   // ✅ cohérent
  onUpdate: 'CASCADE'
})

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
})
