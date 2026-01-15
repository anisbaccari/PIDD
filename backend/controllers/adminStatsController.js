// controllers/adminStatsController.js
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../database/mysql.js';
import { Op } from 'sequelize';

/**
 * Construire les conditions de date pour les requêtes
 */
function buildDateConditions(startDate, endDate) {
  const conditions = {};
  
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    conditions.createdAt = { [Op.gte]: start };
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.createdAt = {
      ...conditions.createdAt,
      [Op.lte]: end
    };
  }
  
  return conditions;
}

/**
 * Récupérer les statistiques générales
 */
export async function getGeneralStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('📊 [getGeneralStats] Période:', startDate, 'au', endDate);
    
    const dateConditions = buildDateConditions(startDate, endDate);
    
    // 🔥 CALCUL DU CA depuis OrderItem
    const revenueResult = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn('SUM', 
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
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      raw: true
    });
    
    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);
    
    // Nombre total de commandes (excluant annulées et en attente)
    const totalOrders = await Order.count({
      where: {
        ...dateConditions,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      }
    });
    
    // Panier moyen
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Clients uniques (distincts)
    const uniqueCustomersResult = await Order.findOne({
      attributes: [
        [
          sequelize.fn('COUNT', 
            sequelize.fn('DISTINCT', sequelize.col('userId'))
          ), 
          'uniqueCustomers'
        ]
      ],
      where: {
        ...dateConditions,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      raw: true
    });
    
    const uniqueCustomers = parseInt(uniqueCustomersResult?.uniqueCustomers || 0);
    
    // Commandes par jour (moyenne)
    let averageOrdersPerDay = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
      averageOrdersPerDay = totalOrders / daysDiff;
    }
    
    // Commandes par statut
    const ordersByStatusResult = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: dateConditions,
      group: ['status'],
      raw: true
    });
    
    const ordersByStatus = {};
    ordersByStatusResult.forEach(item => {
      ordersByStatus[item.status] = parseInt(item.count || 0);
    });
    
    // Récupérer les nouveaux clients (première commande dans la période)
    const newCustomersResult = await sequelize.query(`
      SELECT COUNT(DISTINCT userId) as newCustomers
      FROM orders o1
      WHERE o1.createdAt >= :startDate
        AND o1.createdAt <= :endDate
        AND o1.status NOT IN ('cancelled', 'pending')
        AND NOT EXISTS (
          SELECT 1 FROM orders o2 
          WHERE o2.userId = o1.userId 
          AND o2.createdAt < :startDate
          AND o2.status NOT IN ('cancelled', 'pending')
        )
    `, {
      replacements: {
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : '1970-01-01',
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] + ' 23:59:59' : new Date().toISOString()
      },
      type: sequelize.QueryTypes.SELECT
    });
    
    const newCustomers = parseInt(newCustomersResult[0]?.newCustomers || 0);
    
    console.log('✅ Stats calculées:', {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      uniqueCustomers,
      newCustomers,
      averageOrdersPerDay
    });
    
    reply.send({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        newCustomers: newCustomers, // Utiliser les vrais nouveaux clients
        activeCustomers: uniqueCustomers, // Clients uniques
        averageOrdersPerDay: parseFloat(averageOrdersPerDay.toFixed(2)),
        ordersByStatus
      }
    });
    
  } catch (error) {
    console.error('❌ [getGeneralStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message,
      message: 'Erreur lors du chargement des statistiques générales'
    });
  }
}

/**
 * Récupérer l'évolution du chiffre d'affaires
 */
export async function getRevenueEvolution(request, reply) {
  try {
    const { startDate, endDate, groupBy = 'day' } = request.query;
    console.log('============STATS=============', groupBy);
    
    console.log('📈 [getRevenueEvolution] GroupBy:', groupBy);
    
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const dateConditions = buildDateConditions(startDate, endDate);
    
    const revenueData = await OrderItem.findAll({
      attributes: [
        [
          sequelize.fn('DATE_FORMAT', 
            sequelize.col('order.createdAt'), 
            dateFormat
          ), 
          'period'
        ],
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'revenue'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.fn('DISTINCT', sequelize.col('orderId'))
          ), 
          'orders'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('order.createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('order.createdAt'), dateFormat), 'ASC']],
      raw: true
    });
    
    const formattedData = revenueData.map(item => ({
      period: item.period,
      revenue: parseFloat(item.revenue || 0),
      orders: parseInt(item.orders || 0)
    }));
    
    // Remplir les dates manquantes
    const filledData = fillMissingDates(formattedData, startDate, endDate, groupBy);
    
    reply.send({
      success: true,
      data: filledData
    });
    
  } catch (error) {
    console.error('❌ [getRevenueEvolution] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Remplir les dates manquantes dans les données
 */
function fillMissingDates(data, startDate, endDate, groupBy = 'day') {
  if (!data.length || !startDate || !endDate) return data;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];
  const dataMap = new Map(data.map(item => [item.period, item]));
  
  let current = new Date(start);
  
  while (current <= end) {
    let key;
    switch (groupBy) {
      case 'day':
        key = current.toISOString().split('T')[0];
        break;
      case 'week':
        const year = current.getFullYear();
        const week = getWeekNumber(current);
        key = `${year}-${week.toString().padStart(2, '0')}`;
        break;
      case 'month':
        key = current.toISOString().substring(0, 7);
        break;
      default:
        key = current.toISOString().split('T')[0];
    }
    
    if (dataMap.has(key)) {
      result.push(dataMap.get(key));
    } else {
      result.push({
        period: key,
        revenue: 0,
        orders: 0
      });
    }
    
    // Incrémenter la date selon le groupBy
    switch (groupBy) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }
  
  return result;
}

/**
 * Obtenir le numéro de semaine
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Récupérer les top produits
 */
export async function getTopProducts(request, reply) {
  try {
    const { startDate, endDate, limit = 10 } = request.query;
    
    console.log('🏆 [getTopProducts] Limit:', limit);
    
    const dateConditions = buildDateConditions(startDate, endDate);
    
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'totalRevenue'
        ],
        [
          sequelize.fn('AVG', 
            sequelize.col('unitPrice')
          ), 
          'avgPrice'
        ]
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'img', 'price', 'category', 'description']
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            ...dateConditions,
            status: { [Op.notIn]: ['cancelled', 'pending'] }
          },
          required: true
        }
      ],
      group: ['productId'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']],
      limit: parseInt(limit) || 10,
      raw: true,
      nest: true
    });
    
    const formattedProducts = topProducts.map(item => {
      const product = item.product || {};
      const quantity = parseInt(item.totalQuantity || 0);
      const revenue = parseFloat(item.totalRevenue || 0);
      const avgPrice = parseFloat(item.avgPrice || product.price || 0);
      
      return {
        id: product.id || item.productId,
        name: product.name || `Produit #${item.productId}`,
        image: product.img || null,
        category: product.category || 'Non catégorisé',
        quantity,
        revenue: Math.round(revenue * 100) / 100,
        price: avgPrice
      };
    });
    
    reply.send({
      success: true,
      products: formattedProducts
    });
    
  } catch (error) {
    console.error('❌ [getTopProducts] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Récupérer les ventes par catégorie
 */
export async function getSalesByCategory(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('📊 [getSalesByCategory]');
    
    const dateConditions = buildDateConditions(startDate, endDate);
    
    const categorySales = await OrderItem.findAll({
      attributes: [
        [sequelize.col('product.category'), 'category'],
        [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantity'],
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'totalRevenue'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.fn('DISTINCT', sequelize.col('orderId'))
          ), 
          'orderCount'
        ]
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: []
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            ...dateConditions,
            status: { [Op.notIn]: ['cancelled', 'pending'] }
          },
          required: true
        }
      ],
      group: ['product.category'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']],
      raw: true
    });
    
    const formattedCategories = categorySales.map(item => ({
      category: item.category || 'Sans catégorie',
      quantity: parseInt(item.totalQuantity || 0),
      revenue: parseFloat(item.totalRevenue || 0),
      orderCount: parseInt(item.orderCount || 0)
    }));
    
    // Calculer les pourcentages
    const totalRevenue = formattedCategories.reduce((sum, cat) => sum + cat.revenue, 0);
    formattedCategories.forEach(cat => {
      cat.percentage = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
    });
    
    reply.send({
      success: true,
      categories: formattedCategories
    });
    
  } catch (error) {
    console.error('❌ [getSalesByCategory] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Récupérer les statistiques clients
 */
export async function getCustomerStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('👥 [getCustomerStats]');
    
    // Détection des nouveaux clients (première commande dans la période)
    const newCustomersQuery = `
      SELECT 
        COUNT(DISTINCT userId) as count,
        SUM(totalPrice) as revenue
      FROM orders
      WHERE createdAt >= :startDate 
        AND createdAt <= :endDate
        AND status NOT IN ('cancelled', 'pending')
        AND NOT EXISTS (
          SELECT 1 FROM orders o2 
          WHERE o2.userId = orders.userId 
          AND o2.createdAt < :startDate
          AND o2.status NOT IN ('cancelled', 'pending')
        )
    `;
    
    // Clients réguliers (2-4 commandes ou < 500€)
    const regularCustomersQuery = `
      SELECT 
        COUNT(DISTINCT userId) as count,
        SUM(totalPrice) as revenue
      FROM (
        SELECT 
          userId,
          COUNT(id) as orderCount,
          SUM(totalPrice) as totalSpent
        FROM orders
        WHERE createdAt >= :startDate 
          AND createdAt <= :endDate
          AND status NOT IN ('cancelled', 'pending')
        GROUP BY userId
        HAVING (orderCount BETWEEN 2 AND 4 OR totalSpent < 500)
          AND userId NOT IN (
            SELECT DISTINCT userId FROM orders
            WHERE createdAt < :startDate
            AND status NOT IN ('cancelled', 'pending')
          )
      ) as filtered
    `;
    
    // Clients VIP (5+ commandes ou >= 500€)
    const vipCustomersQuery = `
      SELECT 
        COUNT(DISTINCT userId) as count,
        SUM(totalPrice) as revenue
      FROM (
        SELECT 
          userId,
          COUNT(id) as orderCount,
          SUM(totalPrice) as totalSpent
        FROM orders
        WHERE createdAt >= :startDate 
          AND createdAt <= :endDate
          AND status NOT IN ('cancelled', 'pending')
        GROUP BY userId
        HAVING orderCount >= 5 OR totalSpent >= 500
      ) as vip
    `;
    
    // Taux de rétention (clients qui ont commandé avant ET pendant la période)
    const retentionQuery = `
      SELECT 
        COUNT(DISTINCT userId) as returningCustomers
      FROM orders
      WHERE createdAt >= :startDate 
        AND createdAt <= :endDate
        AND status NOT IN ('cancelled', 'pending')
        AND userId IN (
          SELECT DISTINCT userId FROM orders
          WHERE createdAt < :startDate
          AND status NOT IN ('cancelled', 'pending')
        )
    `;
    
    const replacements = {
      startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : '1970-01-01',
      endDate: endDate ? new Date(endDate).toISOString().split('T')[0] + ' 23:59:59' : new Date().toISOString()
    };
    
    const [
      newCustomersResult,
      regularCustomersResult,
      vipCustomersResult,
      retentionResult,
      totalCustomersResult
    ] = await Promise.all([
      sequelize.query(newCustomersQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(regularCustomersQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(vipCustomersQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(retentionQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      Order.count({
        distinct: true,
        col: 'userId',
        where: {
          createdAt: { 
            [Op.between]: [
              new Date(startDate || '1970-01-01'),
              new Date(endDate || new Date().toISOString())
            ]
          },
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        }
      })
    ]);
    
    const newCustomers = parseInt(newCustomersResult[0]?.count || 0);
    const newRevenue = parseFloat(newCustomersResult[0]?.revenue || 0);
    
    const regularCustomers = parseInt(regularCustomersResult[0]?.count || 0);
    const regularRevenue = parseFloat(regularCustomersResult[0]?.revenue || 0);
    
    const vipCustomers = parseInt(vipCustomersResult[0]?.count || 0);
    const vipRevenue = parseFloat(vipCustomersResult[0]?.revenue || 0);
    
    const returningCustomers = parseInt(retentionResult[0]?.returningCustomers || 0);
    
    // CLV (Customer Lifetime Value) moyen
    const clvQuery = await sequelize.query(`
      SELECT AVG(totalSpent) as avgCLV
      FROM (
        SELECT 
          userId,
          SUM(totalPrice) as totalSpent
        FROM orders
        WHERE status NOT IN ('cancelled', 'pending')
        GROUP BY userId
      ) as customer_spending
    `, { type: sequelize.QueryTypes.SELECT });
    
    const avgCLV = parseFloat(clvQuery[0]?.avgCLV || 0);
    
    // Taux de rétention
    const totalActiveCustomers = newCustomers + regularCustomers + vipCustomers;
    const retentionRate = totalActiveCustomers > 0 
      ? ((returningCustomers / totalActiveCustomers) * 100).toFixed(1)
      : '0.0';
    
    reply.send({
      success: true,
      customerStats: {
        totalCustomers: totalCustomersResult,
        newCustomers,
        newRevenue: Math.round(newRevenue * 100) / 100,
        regularCustomers,
        regularRevenue: Math.round(regularRevenue * 100) / 100,
        vipCustomers,
        vipRevenue: Math.round(vipRevenue * 100) / 100,
        clv: Math.round(avgCLV * 100) / 100,
        retentionRate: parseFloat(retentionRate)
      }
    });
    
  } catch (error) {
    console.error('❌ [getCustomerStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Récupérer les statistiques produits
 */
export async function getProductStats(request, reply) {
  try {
    const { startDate, endDate, limit = 50 } = request.query;
    
    console.log('📦 [getProductStats]');
    
    // Récupérer tous les produits avec leurs statistiques de vente
    const products = await Product.findAll({
      attributes: [
        'id', 
        'name', 
        'img', 
        'price', 
        'quantity', 
        'category',
        'description',
        [
          sequelize.literal('(SELECT SUM(quantity) FROM order_items oi WHERE oi.productId = Product.id)'),
          'totalSold'
        ],
        [
          sequelize.literal('(SELECT SUM(oi.quantity * oi.unitPrice) FROM order_items oi WHERE oi.productId = Product.id)'),
          'totalRevenue'
        ]
      ],
      limit: parseInt(limit) || 50
    });
    
    // Récupérer les ventes pour la période spécifiée
    const dateConditions = buildDateConditions(startDate, endDate);
    
    const periodSales = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'periodSales'],
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'periodRevenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      group: ['productId'],
      raw: true
    });
    
    // Créer un map pour les ventes de la période
    const periodSalesMap = new Map();
    periodSales.forEach(item => {
      periodSalesMap.set(item.productId, {
        sales: parseInt(item.periodSales || 0),
        revenue: parseFloat(item.periodRevenue || 0)
      });
    });
    
    const formattedStats = products.map(product => {
      const productData = product.get({ plain: true });
      const periodData = periodSalesMap.get(product.id) || { sales: 0, revenue: 0 };
      const totalSold = parseInt(productData.totalSold || 0);
      const stock = parseInt(productData.quantity || 0);
      const totalAvailable = totalSold + stock;
      
      // Calculer le pourcentage de stock
      const stockPercent = totalAvailable > 0 
        ? Math.min((stock / totalAvailable) * 100, 100) 
        : 0;
      
      // Calculer la rotation (jours de stock basés sur la moyenne des ventes journalières)
      let turnover = 0;
      if (startDate && endDate && periodData.sales > 0) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysInPeriod = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
        const avgDailySales = periodData.sales / daysInPeriod;
        turnover = avgDailySales > 0 ? Math.ceil(stock / avgDailySales) : 0;
      }
      
      return {
        id: product.id,
        name: product.name,
        image: product.img,
        sku: `PRD-${product.id.toString().padStart(6, '0')}`,
        sales: periodData.sales,
        revenue: Math.round(periodData.revenue * 100) / 100,
        stock,
        stockPercent: Math.round(stockPercent * 10) / 10,
        turnover,
        category: product.category || 'Non catégorisé',
        price: parseFloat(product.price || 0)
      };
    });
    
    // Trier par revenue décroissant
    formattedStats.sort((a, b) => b.revenue - a.revenue);
    
    reply.send({
      success: true,
      products: formattedStats
    });
    
  } catch (error) {
    console.error('❌ [getProductStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Statistiques en temps réel (pour widget)
 */
export async function getRealtimeStats(request, reply) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    
    // Commandes aujourd'hui
    const todayOrders = await Order.count({
      where: {
        createdAt: { [Op.between]: [todayStart, todayEnd] },
        status: { [Op.notIn]: ['cancelled'] }
      }
    });
    
    // CA aujourd'hui
    const todayRevenueResult = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'revenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          createdAt: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      raw: true
    });
    
    const todayRevenue = parseFloat(todayRevenueResult?.revenue || 0);
    
    // CA hier (pour comparaison)
    const yesterdayRevenueResult = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'revenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          createdAt: { [Op.between]: [yesterdayStart, yesterdayEnd] },
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      raw: true
    });
    
    const yesterdayRevenue = parseFloat(yesterdayRevenueResult?.revenue || 0);
    
    // Nouveaux clients aujourd'hui
    const newCustomersToday = await User.count({
      where: {
        createdAt: { [Op.between]: [todayStart, todayEnd] },
        role: 'customer'
      }
    });
    
    // Commandes par statut aujourd'hui
    const todayStatusStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.between]: [todayStart, todayEnd] }
      },
      group: ['status'],
      raw: true
    });
    
    const todayOrdersByStatus = {};
    todayStatusStats.forEach(item => {
      todayOrdersByStatus[item.status] = parseInt(item.count || 0);
    });
    
    // Produits les plus vendus aujourd'hui
    const todayTopProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity'],
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'revenue'
        ]
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name']
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            createdAt: { [Op.between]: [todayStart, todayEnd] },
            status: { [Op.notIn]: ['cancelled', 'pending'] }
          },
          required: true
        }
      ],
      group: ['productId'],
      order: [[sequelize.literal('quantity'), 'DESC']],
      limit: 5,
      raw: true
    });
    
    const formattedTopProducts = todayTopProducts.map(item => ({
      id: item.productId,
      name: item.product?.name || `Produit #${item.productId}`,
      quantity: parseInt(item.quantity || 0),
      revenue: parseFloat(item.revenue || 0)
    }));
    
    reply.send({
      success: true,
      realtime: {
        todayOrders,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        yesterdayRevenue: Math.round(yesterdayRevenue * 100) / 100,
        revenueGrowth: yesterdayRevenue > 0 
          ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 * 100) / 100
          : 0,
        newCustomersToday,
        todayOrdersByStatus,
        todayTopProducts: formattedTopProducts,
        lastUpdate: now.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [getRealtimeStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Dashboard complet (toutes les stats en une seule requête)
 */
export async function getDashboardStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('📊 [getDashboardStats] Période:', startDate, 'au', endDate);
    
    // Exécuter toutes les requêtes en parallèle
    const [
      generalStats,
      revenueEvolution,
      topProducts,
      categories,
      customerStats,
      productStats
    ] = await Promise.all([
      getStatsData(startDate, endDate),
      getRevenueEvolutionData(startDate, endDate),
      getTopProductsData(startDate, endDate, 5),
      getCategoriesData(startDate, endDate),
      getCustomerStatsData(startDate, endDate),
      getProductStatsData(startDate, endDate, 10)
    ]);
    
    reply.send({
      success: true,
      dashboard: {
        general: generalStats,
        revenueEvolution,
        topProducts,
        categories,
        customerStats,
        productStats
      }
    });
    
  } catch (error) {
    console.error('❌ [getDashboardStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Fonction helper pour les stats générales
 */
async function getStatsData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const revenueResult = await OrderItem.findOne({
    attributes: [
      [
        sequelize.fn('SUM', 
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
        ...dateConditions,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      required: true
    }],
    raw: true
  });
  
  const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);
  
  const totalOrders = await Order.count({
    where: {
      ...dateConditions,
      status: { [Op.notIn]: ['cancelled', 'pending'] }
    }
  });
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100
  };
}

/**
 * Fonction helper pour l'évolution du revenu
 */
async function getRevenueEvolutionData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const data = await OrderItem.findAll({
    attributes: [
      [
        sequelize.fn('DATE_FORMAT', 
          sequelize.col('order.createdAt'), 
          '%Y-%m-%d'
        ), 
        'date'
      ],
      [
        sequelize.fn('SUM', 
          sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
        ), 
        'revenue'
      ]
    ],
    include: [{
      model: Order,
      as: 'order',
      attributes: [],
      where: {
        ...dateConditions,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      required: true
    }],
    group: [sequelize.fn('DATE_FORMAT', sequelize.col('order.createdAt'), '%Y-%m-%d')],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('order.createdAt'), '%Y-%m-%d'), 'ASC']],
    raw: true
  });
  
  return data.map(item => ({
    date: item.date,
    revenue: parseFloat(item.revenue || 0)
  }));
}

/**
 * Fonction helper pour les top produits
 */
async function getTopProductsData(startDate, endDate, limit) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const topProducts = await OrderItem.findAll({
    attributes: [
      'productId',
      [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantity'],
      [
        sequelize.fn('SUM', 
          sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
        ), 
        'totalRevenue'
      ]
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'img']
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }
    ],
    group: ['productId'],
    order: [[sequelize.literal('totalRevenue'), 'DESC']],
    limit: limit || 5,
    raw: true,
    nest: true
  });
  
  return topProducts.map(item => ({
    id: item.product?.id || item.productId,
    name: item.product?.name || `Produit #${item.productId}`,
    image: item.product?.img || null,
    quantity: parseInt(item.totalQuantity || 0),
    revenue: parseFloat(item.totalRevenue || 0)
  }));
}

/**
 * Fonction helper pour les catégories
 */
async function getCategoriesData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const categories = await OrderItem.findAll({
    attributes: [
      [sequelize.col('product.category'), 'category'],
      [
        sequelize.fn('SUM', 
          sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
        ), 
        'revenue'
      ]
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: []
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }
    ],
    group: ['product.category'],
    raw: true
  });
  
  return categories.map(item => ({
    category: item.category || 'Sans catégorie',
    revenue: parseFloat(item.revenue || 0)
  }));
}

/**
 * Fonction helper pour les stats clients
 */
async function getCustomerStatsData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const customerOrders = await sequelize.query(`
    SELECT 
      o.userId,
      COUNT(DISTINCT o.id) as orderCount,
      SUM(oi.quantity * oi.unitPrice) as totalSpent
    FROM orders o
    INNER JOIN order_items oi ON oi.orderId = o.id
    WHERE o.status NOT IN ('cancelled', 'pending')
      ${startDate ? `AND o.createdAt >= '${new Date(startDate).toISOString().split('T')[0]}'` : ''}
      ${endDate ? `AND o.createdAt <= '${new Date(endDate).toISOString().split('T')[0]} 23:59:59'` : ''}
    GROUP BY o.userId
  `, { type: sequelize.QueryTypes.SELECT });
  
  let vipCustomers = 0;
  let vipRevenue = 0;
  let regularCustomers = 0;
  let regularRevenue = 0;
  let newCustomers = 0;
  let newRevenue = 0;
  let totalRevenue = 0;
  
  customerOrders.forEach(item => {
    const orderCount = parseInt(item.orderCount || 0);
    const totalSpent = parseFloat(item.totalSpent || 0);
    totalRevenue += totalSpent;
    
    if (orderCount >= 5 || totalSpent >= 500) {
      vipCustomers++;
      vipRevenue += totalSpent;
    } else if (orderCount >= 2) {
      regularCustomers++;
      regularRevenue += totalSpent;
    } else {
      newCustomers++;
      newRevenue += totalSpent;
    }
  });
  
  const totalCustomers = customerOrders.length;
  const clv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  return {
    totalCustomers,
    newCustomers,
    newRevenue: Math.round(newRevenue * 100) / 100,
    regularCustomers,
    regularRevenue: Math.round(regularRevenue * 100) / 100,
    vipCustomers,
    vipRevenue: Math.round(vipRevenue * 100) / 100,
    clv: Math.round(clv * 100) / 100,
    retentionRate: totalCustomers > 0 
      ? ((regularCustomers + vipCustomers) / totalCustomers * 100).toFixed(1)
      : '0.0'
  };
}

/**
 * Fonction helper pour les stats produits
 */
async function getProductStatsData(startDate, endDate, limit) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const productStats = await OrderItem.findAll({
    attributes: [
      'productId',
      [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'sales'],
      [
        sequelize.fn('SUM', 
          sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
        ), 
        'revenue'
      ]
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'img', 'price', 'quantity', 'category']
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          ...dateConditions,
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }
    ],
    group: ['productId'],
    order: [[sequelize.literal('revenue'), 'DESC']],
    limit: limit || 10,
    raw: true,
    nest: true
  });
  
  return productStats.map(item => {
    const product = item.product || {};
    const sales = parseInt(item.sales || 0);
    const stock = parseInt(product.quantity || 0);
    const revenue = parseFloat(item.revenue || 0);
    const stockPercent = stock > 0 ? Math.min((stock / (stock + sales)) * 100, 100) : 0;
    
    let turnover = 0;
    if (startDate && endDate && sales > 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysInPeriod = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
      const avgDailySales = sales / daysInPeriod;
      turnover = avgDailySales > 0 ? Math.ceil(stock / avgDailySales) : 0;
    }
    
    return {
      id: product.id || item.productId,
      name: product.name || `Produit #${item.productId}`,
      image: product.img || null,
      sku: `PRD-${(product.id || item.productId).toString().padStart(6, '0')}`,
      sales,
      revenue: Math.round(revenue * 100) / 100,
      stock,
      stockPercent: Math.round(stockPercent * 10) / 10,
      turnover,
      category: product.category || 'Non catégorisé'
    };
  });
}

/**
 * Endpoint de test pour vérifier la connexion
 */
export async function testStats(request, reply) {
  try {
    // Test de connexion aux modèles
    const orderCount = await Order.count();
    const productCount = await Product.count();
    const userCount = await User.count({ where: { role: 'customer' } });
    
    // Test des requêtes de base
    const todayRevenue = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn('SUM', 
            sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
          ), 
          'revenue'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: { [Op.notIn]: ['cancelled', 'pending'] }
        },
        required: true
      }],
      raw: true
    });
    
    reply.send({
      success: true,
      message: 'API Stats fonctionnelle',
      counts: {
        orders: orderCount,
        products: productCount,
        customers: userCount
      },
      testRevenue: parseFloat(todayRevenue?.revenue || 0),
      endpoints: [
        'GET  /admin/stats/general',
        'GET  /admin/stats/revenue-evolution',
        'GET  /admin/stats/top-products',
        'GET  /admin/stats/categories',
        'GET  /admin/stats/customers',
        'GET  /admin/stats/products',
        'GET  /admin/stats/dashboard',
        'GET  /admin/stats/realtime',
        'GET  /admin/stats/test'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [testStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message,
      message: 'Erreur de connexion à la base de données',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Export des données en CSV
 */
export async function exportStats(request, reply) {
  try {
    const { startDate, endDate, type = 'orders' } = request.query;
    
    console.log(`📤 [exportStats] Export type: ${type}`);
    
    const dateConditions = buildDateConditions(startDate, endDate);
    
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'orders':
        const orders = await Order.findAll({
          where: {
            ...dateConditions,
            status: { [Op.notIn]: ['cancelled'] }
          },
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'fullName', 'email']
            }
          ],
          raw: true,
          nest: true
        });
        
        data = orders.map(order => ({
          'Numéro': order.orderNumber || order.id,
          'Date': new Date(order.createdAt).toLocaleDateString('fr-FR'),
          'Heure': new Date(order.createdAt).toLocaleTimeString('fr-FR'),
          'Client': order.customer?.fullName || 'Anonyme',
          'Email': order.customer?.email || '',
          'Montant': order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) + '€' : '0.00€',
          'Statut': getStatusLabel(order.status),
          'Paiement': order.paymentMethod || 'N/A',
          'Adresse': order.shippingAddress || 'N/A'
        }));
        
        filename = `commandes_${startDate || 'all'}_${endDate || 'now'}.csv`;
        break;
        
      case 'products':
        const products = await OrderItem.findAll({
          attributes: [
            'productId',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
            [
              sequelize.fn('SUM', 
                sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
              ), 
              'totalRevenue'
            ],
            [
              sequelize.fn('AVG', 
                sequelize.col('unitPrice')
              ), 
              'avgPrice'
            ]
          ],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'price']
            },
            {
              model: Order,
              as: 'order',
              attributes: [],
              where: {
                ...dateConditions,
                status: { [Op.notIn]: ['cancelled', 'pending'] }
              },
              required: true
            }
          ],
          group: ['productId'],
          raw: true,
          nest: true
        });
        
        data = products.map(item => ({
          'ID Produit': item.productId,
          'Nom': item.product?.name || `Produit #${item.productId}`,
          'Catégorie': item.product?.category || 'N/A',
          'Prix catalogue': item.product?.price ? parseFloat(item.product.price).toFixed(2) + '€' : 'N/A',
          'Prix moyen vendu': item.avgPrice ? parseFloat(item.avgPrice).toFixed(2) + '€' : 'N/A',
          'Quantité vendue': item.totalQuantity,
          'Chiffre d\'affaires': item.totalRevenue ? parseFloat(item.totalRevenue).toFixed(2) + '€' : '0.00€'
        }));
        
        filename = `produits_${startDate || 'all'}_${endDate || 'now'}.csv`;
        break;
        
      case 'customers':
        const customers = await sequelize.query(`
          SELECT 
            u.id,
            u.fullName,
            u.email,
            u.phone,
            u.createdAt as registrationDate,
            COUNT(DISTINCT o.id) as orderCount,
            SUM(oi.quantity * oi.unitPrice) as totalSpent,
            MAX(o.createdAt) as lastOrderDate
          FROM users u
          LEFT JOIN orders o ON o.userId = u.id AND o.status NOT IN ('cancelled', 'pending')
          LEFT JOIN order_items oi ON oi.orderId = o.id
          WHERE u.role = 'customer'
            ${startDate ? `AND o.createdAt >= '${new Date(startDate).toISOString().split('T')[0]}'` : ''}
            ${endDate ? `AND o.createdAt <= '${new Date(endDate).toISOString().split('T')[0]} 23:59:59'` : ''}
          GROUP BY u.id
          ORDER BY totalSpent DESC
        `, { type: sequelize.QueryTypes.SELECT });
        
        data = customers.map(customer => ({
          'ID': customer.id,
          'Nom': customer.fullName,
          'Email': customer.email,
          'Téléphone': customer.phone || 'N/A',
          'Date d\'inscription': customer.registrationDate ? 
            new Date(customer.registrationDate).toLocaleDateString('fr-FR') : 'N/A',
          'Nombre de commandes': customer.orderCount || 0,
          'Montant total dépensé': customer.totalSpent ? 
            parseFloat(customer.totalSpent).toFixed(2) + '€' : '0.00€',
          'Dernière commande': customer.lastOrderDate ? 
            new Date(customer.lastOrderDate).toLocaleDateString('fr-FR') : 'N/A'
        }));
        
        filename = `clients_${startDate || 'all'}_${endDate || 'now'}.csv`;
        break;
        
      case 'categories':
        const categories = await OrderItem.findAll({
          attributes: [
            [sequelize.col('product.category'), 'category'],
            [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantity'],
            [
              sequelize.fn('SUM', 
                sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`unitPrice`')
              ), 
              'totalRevenue'
            ],
            [
              sequelize.fn('COUNT', 
                sequelize.fn('DISTINCT', sequelize.col('productId'))
              ), 
              'productCount'
            ]
          ],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: []
            },
            {
              model: Order,
              as: 'order',
              attributes: [],
              where: {
                ...dateConditions,
                status: { [Op.notIn]: ['cancelled', 'pending'] }
              },
              required: true
            }
          ],
          group: ['product.category'],
          raw: true
        });
        
        data = categories.map(item => ({
          'Catégorie': item.category || 'Sans catégorie',
          'Nombre de produits': item.productCount || 0,
          'Quantité vendue': item.totalQuantity || 0,
          'Chiffre d\'affaires': item.totalRevenue ? 
            parseFloat(item.totalRevenue).toFixed(2) + '€' : '0.00€'
        }));
        
        filename = `categories_${startDate || 'all'}_${endDate || 'now'}.csv`;
        break;
        
      default:
        return reply.status(400).send({
          success: false,
          error: 'Type d\'export non supporté. Types disponibles: orders, products, customers, categories'
        });
    }
    
    // Convertir en CSV
    const csv = convertToCSV(data);
    
    // Définir les headers pour le téléchargement
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    
    reply.send(csv);
    
  } catch (error) {
    console.error('❌ [exportStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Convertir des données en CSV
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return 'Aucune donnée disponible';
  }
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les virgules, guillemets et retours à la ligne
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Obtenir le libellé d'un statut
 */
function getStatusLabel(status) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    completed: 'Terminée'
  };
  return labels[status] || status;
}

