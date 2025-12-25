// controllers/adminDashboardController.js
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../database/mysql.js';
import { Op } from 'sequelize';

/**
 * Récupérer toutes les statistiques pour le dashboard
 */
export async function getDashboardStats(request, reply) {
  try {
    console.log('📊 [getDashboardStats] Début...');
    
    // Calculer toutes les statistiques en parallèle
    const [
      totalProducts,
      pendingOrders,
      monthlyRevenue,
      totalUsers,
      recentOrders,
      topProducts,
      userStats,
      orderStats
    ] = await Promise.all([
      // 1. Total produits
      Product.count(),
      
      // 2. Commandes en cours (pending + processing)
      Order.count({
        where: {
          status: {
            [Op.in]: ['pending', 'processing', 'confirmed']
          }
        }
      }),
      
      // 3. Revenus du mois en cours
      calculateMonthlyRevenue(),
      
      // 4. Total utilisateurs
      User.count(),
      
      // 5. Commandes récentes (5 dernières)
      getRecentOrders(5),
      
      // 6. Produits les plus vendus
      getTopProducts(5),
      
      // 7. Statistiques utilisateurs
      getUserStats(),
      
      // 8. Statistiques commandes
      getOrderStats()
    ]);
    
    console.log('✅ [getDashboardStats] Toutes les stats calculées');
    
    reply.send({
      success: true,
      stats: {
        totalProducts,
        pendingOrders,
        monthlyRevenue,
        totalUsers,
        recentOrders,
        topProducts,
        userStats,
        orderStats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [getDashboardStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: 'Erreur lors du chargement des statistiques',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Calculer les revenus du mois en cours
 */
async function calculateMonthlyRevenue() {
  try {
    // Début et fin du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const result = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ),
          'totalRevenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth]
          },
          status: { [Op.notIn]: ['cancelled'] }
        }
      }],
      raw: true
    });
    
    return parseFloat(result?.totalRevenue || 0);
  } catch (error) {
    console.error('❌ [calculateMonthlyRevenue] Erreur:', error);
    return 0;
  }
}

/**
 * Récupérer les commandes récentes
 */
async function getRecentOrders(limit = 5) {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'name', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      raw: true,
      nest: true
    });
    
    return orders.map(order => ({
      id: order.id,
      orderNumber: `CMD-${order.id.toString().padStart(6, '0')}`,
      createdAt: order.createdAt,
      status: order.status,
      totalPrice: order.totalPrice || 0,
      customer: {
        name: order.user?.name || order.user?.username || 'Client',
        email: order.user?.email || ''
      }
    }));
  } catch (error) {
    console.error('❌ [getRecentOrders] Erreur:', error);
    return [];
  }
}

/**
 * Récupérer les produits les plus vendus
 */
async function getTopProducts(limit = 5) {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ),
          'totalRevenue'
        ]
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'img', 'price']
      }],
      group: ['productId'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: limit,
      raw: true,
      nest: true
    });
    
    return topProducts.map(item => ({
      id: item.product?.id || item.productId,
      name: item.product?.name || `Produit #${item.productId}`,
      image: item.product?.img,
      price: item.product?.price || 0,
      totalSold: parseInt(item.totalSold || 0),
      totalRevenue: parseFloat(item.totalRevenue || 0)
    }));
  } catch (error) {
    console.error('❌ [getTopProducts] Erreur:', error);
    return [];
  }
}

/**
 * Récupérer les statistiques utilisateurs
 */
async function getUserStats() {
  try {
    // Utilisateurs actifs ce mois-ci
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const activeUsers = await Order.count({
      distinct: true,
      col: 'userId',
      where: {
        createdAt: { [Op.gte]: startOfMonth },
        status: { [Op.notIn]: ['cancelled'] }
      }
    });
    
    // Nouveaux utilisateurs ce mois-ci
    const newUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });
    
    return {
      activeUsers,
      newUsers,
      averageOrdersPerUser: await calculateAverageOrdersPerUser()
    };
  } catch (error) {
    console.error('❌ [getUserStats] Erreur:', error);
    return {
      activeUsers: 0,
      newUsers: 0,
      averageOrdersPerUser: 0
    };
  }
}

/**
 * Calculer le nombre moyen de commandes par utilisateur
 */
async function calculateAverageOrdersPerUser() {
  try {
    const result = await Order.findOne({
      attributes: [
        [
          sequelize.fn('AVG', 
            sequelize.literal('(SELECT COUNT(*) FROM orders o2 WHERE o2.userId = Order.userId)')
          ),
          'avgOrders'
        ]
      ],
      raw: true
    });
    
    return parseFloat(result?.avgOrders || 0).toFixed(1);
  } catch (error) {
    console.error('❌ [calculateAverageOrdersPerUser] Erreur:', error);
    return '0.0';
  }
}

/**
 * Récupérer les statistiques commandes
 */
async function getOrderStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // Commandes aujourd'hui
    const todayOrders = await Order.count({
      where: {
        createdAt: { [Op.between]: [todayStart, todayEnd] },
        status: { [Op.notIn]: ['cancelled'] }
      }
    });
    
    // CA aujourd'hui
    const todayRevenue = await calculateRevenueForPeriod(todayStart, todayEnd);
    
    // Commandes par statut
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    const statusMap = {};
    ordersByStatus.forEach(item => {
      statusMap[item.status] = parseInt(item.count || 0);
    });
    
    return {
      todayOrders,
      todayRevenue,
      ordersByStatus: statusMap,
      totalOrders: await Order.count(),
      totalRevenue: await calculateTotalRevenue()
    };
  } catch (error) {
    console.error('❌ [getOrderStats] Erreur:', error);
    return {
      todayOrders: 0,
      todayRevenue: 0,
      ordersByStatus: {},
      totalOrders: 0,
      totalRevenue: 0
    };
  }
}

/**
 * Calculer le CA total
 */
async function calculateTotalRevenue() {
  try {
    const result = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ),
          'totalRevenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: { [Op.notIn]: ['cancelled'] }
        }
      }],
      raw: true
    });
    
    return parseFloat(result?.totalRevenue || 0);
  } catch (error) {
    console.error('❌ [calculateTotalRevenue] Erreur:', error);
    return 0;
  }
}

/**
 * Calculer le CA pour une période
 */
async function calculateRevenueForPeriod(startDate, endDate) {
  try {
    const result = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ),
          'totalRevenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          status: { [Op.notIn]: ['cancelled'] }
        }
      }],
      raw: true
    });
    
    return parseFloat(result?.totalRevenue || 0);
  } catch (error) {
    console.error('❌ [calculateRevenueForPeriod] Erreur:', error);
    return 0;
  }
}

/**
 * Statistiques en temps réel pour le dashboard
 */
export async function getRealtimeDashboardData(request, reply) {
  try {
    console.log('⏱️ [getRealtimeDashboardData]');
    
    const now = new Date();
    const lastHour = new Date(now.getTime() - (60 * 60 * 1000));
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [
      ordersLastHour,
      revenueLastHour,
      newUsersToday,
      pendingOrdersCount
    ] = await Promise.all([
      // Commandes dernière heure
      Order.count({
        where: {
          createdAt: { [Op.gte]: lastHour },
          status: { [Op.notIn]: ['cancelled'] }
        }
      }),
      
      // CA dernière heure
      calculateRevenueForPeriod(lastHour, now),
      
      // Nouveaux utilisateurs aujourd'hui
      User.count({
        where: {
          createdAt: { [Op.gte]: todayStart }
        }
      }),
      
      // Commandes en attente
      Order.count({
        where: {
          status: 'pending'
        }
      })
    ]);
    
    reply.send({
      success: true,
      realtime: {
        ordersLastHour,
        revenueLastHour: Math.round(revenueLastHour * 100) / 100,
        newUsersToday,
        pendingOrdersCount,
        lastUpdate: now.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [getRealtimeDashboardData] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Endpoint de test pour vérifier la connexion
 */
export async function testDashboardConnection(request, reply) {
  try {
    console.log('🧪 [testDashboardConnection] Test des connexions...');
    
    // Tester toutes les connexions
    const [
      dbTest,
      orderCount,
      userCount,
      productCount
    ] = await Promise.all([
      sequelize.authenticate(),
      Order.count(),
      User.count(),
      Product.count()
    ]);
    
    console.log('✅ Connexions OK');
    
    reply.send({
      success: true,
      message: 'Dashboard API fonctionnelle',
      database: 'connecté',
      counts: {
        orders: orderCount,
        users: userCount,
        products: productCount
      },
      endpoints: [
        'GET /admin/dashboard/stats',
        'GET /admin/dashboard/realtime',
        'GET /admin/dashboard/test'
      ]
    });
    
  } catch (error) {
    console.error('❌ [testDashboardConnection] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message,
      message: 'Erreur de connexion à la base de données'
    });
  }
}