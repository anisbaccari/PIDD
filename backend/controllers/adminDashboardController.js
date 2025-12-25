import { Order } from '../models/Order.js'
import { OrderItem } from '../models/OrderItem.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { sequelize } from '../database/mysql.js'
import { Op } from 'sequelize'

/**
 * 🎯 Dashboard simple — Stats essentielles
 */
export async function getSimpleDashboardStats(request, reply) {
  try {

    const [
      totalProducts,
      totalUsers,
      totalOrders,
      paidOrders,
      monthlyRevenue
    ] = await Promise.all([

      Product.count(),

      User.count(),

      Order.count(),

      Order.count({
        where: { status: 'paid' }
      }),

      calculateMonthlyRevenue()
    ])

    reply.send({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        paidOrders,
        monthlyRevenue
      }
    })

  } catch (err) {
    console.error('❌ getSimpleDashboardStats:', err)
    reply.code(500).send({ message: 'Erreur chargement stats' })
  }
}

/**
 * 💰 CA du mois courant
 */
async function calculateMonthlyRevenue() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const result = await OrderItem.findOne({
    attributes: [
      [
        sequelize.fn(
          'SUM',
          sequelize.literal('quantity * unitPrice')
        ),
        'total'
      ]
    ],
    include: [{
      model: Order,
      where: {
        status: 'paid',
        createdAt: { [Op.between]: [start, end] }
      }
    }],
    raw: true
  })

  return parseFloat(result?.total || 0)
}

/**
 * 📦 Liste simple des commandes (admin)
 */
export async function getAdminOrders(request, reply) {
  try {

    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          include: [ Product ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    reply.send({
      success: true,
      orders
    })

  } catch (err) {
    console.error('❌ getAdminOrders:', err)
    reply.code(500).send({ message: 'Erreur récupération commandes' })
  }
}

/**
 * ⭐ Produits les plus vendus
 */
export async function getTopProducts(request, reply) {
  try {

    const products = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'sold']
      ],
      include: [{
        model: Product,
        attributes: ['id', 'name', 'img', 'price']
      }],
      group: ['productId'],
      order: [[sequelize.literal('sold'), 'DESC']],
      limit: 5
    })

    reply.send({
      success: true,
      products
    })

  } catch (err) {
    console.error('❌ getTopProducts:', err)
    reply.code(500).send({ message: 'Erreur top produits' })
  }
}
