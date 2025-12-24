// controllers/adminStatsController.js
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../database/mysql.js';

/**
 * Récupérer les statistiques générales
 */
export async function getGeneralStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('=====[getGeneralStats] Période:', startDate, 'au', endDate);
    
    // Construire les conditions de date
    const dateConditions = {};
    if (startDate) {
      dateConditions.createdAt = {
        [sequelize.Op.gte]: new Date(startDate)
      };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateConditions.createdAt = {
        ...dateConditions.createdAt,
        [sequelize.Op.lte]: end
      };
    }
    
    // Chiffre d'affaires total (sauf commandes annulées)
    const revenueResult = await Order.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('AVG', sequelize.col('totalPrice')), 'averageOrderValue']
      ],
      where: {
        ...dateConditions,
        status: { [sequelize.Op.notIn]: ['cancelled'] }
      }
    });
    
    // Nombre de nouvelles commandes
    const totalOrders = await Order.count({
      where: dateConditions
    });
    
    // Nouveaux clients (simplification: compte les clients uniques)
    const uniqueCustomers = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'count']
      ],
      where: dateConditions
    });
    
    // Commandes par jour (moyenne)
    const daysDiff = startDate && endDate 
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 30;
    const averageOrdersPerDay = totalOrders / daysDiff;
    
    // Commandes par statut
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: dateConditions,
      group: ['status']
    });
    
    const statusCounts = {};
    ordersByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.get('count'));
    });
    
    reply.send({
      success: true,
      stats: {
        totalRevenue: parseFloat(revenueResult?.dataValues?.totalRevenue || 0),
        totalOrders: parseInt(revenueResult?.dataValues?.totalOrders || 0),
        averageOrderValue: parseFloat(revenueResult?.dataValues?.averageOrderValue || 0),
        newCustomers: parseInt(uniqueCustomers[0]?.dataValues?.count || 0),
        averageOrdersPerDay: parseFloat(averageOrdersPerDay.toFixed(2)),
        ordersByStatus: statusCounts
      }
    });
    
  } catch (error) {
    console.error('❌ [getGeneralStats] Erreur:', error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Récupérer l'évolution du chiffre d'affaires
 */
export async function getRevenueEvolution(request, reply) {
  try {
    const { startDate, endDate, groupBy = 'day' } = request.query;
    
    console.log('=====[getRevenueEvolution] GroupBy:', groupBy);
    
    // Format de date selon le regroupement
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // Année-Semaine
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const dateConditions = {};
    if (startDate) {
      dateConditions.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateConditions.createdAt = {
        ...dateConditions.createdAt,
        [sequelize.Op.lte]: end
      };
    }
    
    const revenueData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      where: {
        ...dateConditions,
        status: { [sequelize.Op.notIn]: ['cancelled'] }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'ASC']]
    });
    
    const formattedData = revenueData.map(item => ({
      period: item.get('period'),
      revenue: parseFloat(item.get('revenue') || 0),
      orders: parseInt(item.get('orders') || 0)
    }));
    
    reply.send({
      success: true,
      data: formattedData
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
 * Récupérer les top produits
 */
export async function getTopProducts(request, reply) {
  try {
    const { startDate, endDate, limit = 10 } = request.query;
    
    console.log('=====[getTopProducts] Limit:', limit);
    
    const dateConditions = {};
    if (startDate || endDate) {
      const orderWhere = {};
      if (startDate) {
        orderWhere.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderWhere.createdAt = {
          ...orderWhere.createdAt,
          [sequelize.Op.lte]: end
        };
      }
      dateConditions.order = orderWhere;
    }
    
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', 
          sequelize.literal('quantity * unitPrice')
        ), 'totalRevenue']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'img', 'category']
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            status: { [sequelize.Op.notIn]: ['cancelled'] },
            ...(dateConditions.order || {})
          }
        }
      ],
      group: ['productId', 'product.id'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']],
      limit: parseInt(limit)
    });
    
    const formattedProducts = topProducts.map(item => {
      const product = item.product || {};
      return {
        id: product.id,
        name: product.name,
        image: product.img,
        category: product.category,
        quantity: parseInt(item.get('totalQuantity') || 0),
        revenue: parseFloat(item.get('totalRevenue') || 0),
        price: parseFloat(product.price || 0)
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
    
    console.log('=====[getSalesByCategory]');
    
    const dateConditions = {};
    if (startDate || endDate) {
      const orderWhere = {};
      if (startDate) {
        orderWhere.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderWhere.createdAt = {
          ...orderWhere.createdAt,
          [sequelize.Op.lte]: end
        };
      }
      dateConditions.order = orderWhere;
    }
    
    const categorySales = await OrderItem.findAll({
      attributes: [
        [sequelize.col('product.category'), 'category'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', 
          sequelize.literal('OrderItem.quantity * OrderItem.unitPrice')
        ), 'totalRevenue']
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
            status: { [sequelize.Op.notIn]: ['cancelled'] },
            ...(dateConditions.order || {})
          }
        }
      ],
      group: ['product.category'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']]
    });
    
    const formattedCategories = categorySales.map(item => ({
      category: item.get('category'),
      quantity: parseInt(item.get('totalQuantity') || 0),
      revenue: parseFloat(item.get('totalRevenue') || 0)
    }));
    
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
    
    console.log('=====[getCustomerStats]');
    
    const dateConditions = {};
    if (startDate) {
      dateConditions.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateConditions.createdAt = {
        ...dateConditions.createdAt,
        [sequelize.Op.lte]: end
      };
    }
    
    // Clients avec leurs commandes
    const customerOrders = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSpent']
      ],
      where: {
        ...dateConditions,
        status: { [sequelize.Op.notIn]: ['cancelled'] }
      },
      group: ['userId'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'name', 'lastName']
        }
      ]
    });
    
    // Segmentation des clients
    let vipCustomers = 0;
    let vipRevenue = 0;
    let regularCustomers = 0;
    let regularRevenue = 0;
    let newCustomers = 0;
    let newRevenue = 0;
    
    customerOrders.forEach(item => {
      const orderCount = parseInt(item.get('orderCount') || 0);
      const totalSpent = parseFloat(item.get('totalSpent') || 0);
      
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
    
    // Clients totaux uniques
    const totalCustomers = customerOrders.length;
    
    // CLV moyen (Customer Lifetime Value)
    const totalRevenue = vipRevenue + regularRevenue + newRevenue;
    const clv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    reply.send({
      success: true,
      customerStats: {
        totalCustomers,
        newCustomers,
        vipCustomers,
        vipRevenue,
        regularCustomers,
        regularRevenue,
        newRevenue,
        clv,
        retentionRate: totalCustomers > 0 
          ? ((regularCustomers + vipCustomers) / totalCustomers * 100).toFixed(1)
          : 0
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
 * Récupérer les statistiques détaillées des produits
 */
export async function getProductStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('=====[getProductStats]');
    
    const dateConditions = {};
    if (startDate || endDate) {
      const orderWhere = {};
      if (startDate) {
        orderWhere.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderWhere.createdAt = {
          ...orderWhere.createdAt,
          [sequelize.Op.lte]: end
        };
      }
      dateConditions.order = orderWhere;
    }
    
    const productStats = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'sales'],
        [sequelize.fn('SUM', 
          sequelize.literal('OrderItem.quantity * OrderItem.unitPrice')
        ), 'revenue']
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
            status: { [sequelize.Op.notIn]: ['cancelled'] },
            ...(dateConditions.order || {})
          }
        }
      ],
      group: ['productId', 'product.id'],
      order: [[sequelize.literal('revenue'), 'DESC']]
    });
    
    const formattedStats = productStats.map(item => {
      const product = item.product || {};
      const sales = parseInt(item.get('sales') || 0);
      const stock = parseInt(product.quantity || 0);
      
      return {
        id: product.id,
        name: product.name,
        image: product.img,
        sku: `PRD-${product.id}`,
        sales,
        revenue: parseFloat(item.get('revenue') || 0),
        stock,
        stockPercent: stock > 0 ? Math.min((stock / (stock + sales)) * 100, 100) : 0,
        turnover: sales > 0 ? Math.ceil(30 / sales * stock) : 0, // Estimation rotation
        category: product.category
      };
    });
    
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
 * Récupérer toutes les statistiques d'un coup (dashboard complet)
 */
export async function getDashboardStats(request, reply) {
  try {
    const { startDate, endDate } = request.query;
    
    console.log('=====[getDashboardStats] Période:', startDate, 'au', endDate);
    
    // Appeler toutes les fonctions de stats
    const generalStatsPromise = getStatsData(startDate, endDate);
    const topProductsPromise = getTopProductsData(startDate, endDate, 5);
    const categoriesPromise = getCategoriesData(startDate, endDate);
    const revenueEvolutionPromise = getRevenueEvolutionData(startDate, endDate);
    const customerStatsPromise = getCustomerStatsData(startDate, endDate);
    
    const [generalStats, topProducts, categories, revenueEvolution, customerStats] = await Promise.all([
      generalStatsPromise,
      topProductsPromise,
      categoriesPromise,
      revenueEvolutionPromise,
      customerStatsPromise
    ]);
    
    reply.send({
      success: true,
      dashboard: {
        general: generalStats,
        topProducts,
        categories,
        revenueEvolution,
        customers: customerStats
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

// Fonctions helpers pour getDashboardStats
async function getStatsData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const result = await Order.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      [sequelize.fn('AVG', sequelize.col('totalPrice')), 'averageOrderValue']
    ],
    where: {
      ...dateConditions,
      status: { [sequelize.Op.notIn]: ['cancelled'] }
    }
  });
  
  return {
    totalRevenue: parseFloat(result?.dataValues?.totalRevenue || 0),
    totalOrders: parseInt(result?.dataValues?.totalOrders || 0),
    averageOrderValue: parseFloat(result?.dataValues?.averageOrderValue || 0)
  };
}

async function getTopProductsData(startDate, endDate, limit) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const topProducts = await OrderItem.findAll({
    attributes: [
      'productId',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalRevenue']
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
          status: { [sequelize.Op.notIn]: ['cancelled'] }
        }
      }
    ],
    group: ['productId', 'product.id'],
    order: [[sequelize.literal('totalRevenue'), 'DESC']],
    limit: limit
  });
  
  return topProducts.map(item => ({
    id: item.product?.id,
    name: item.product?.name,
    image: item.product?.img,
    quantity: parseInt(item.get('totalQuantity') || 0),
    revenue: parseFloat(item.get('totalRevenue') || 0)
  }));
}

async function getCategoriesData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const categories = await OrderItem.findAll({
    attributes: [
      [sequelize.col('product.category'), 'category'],
      [sequelize.fn('SUM', sequelize.literal('OrderItem.quantity * OrderItem.unitPrice')), 'revenue']
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
          status: { [sequelize.Op.notIn]: ['cancelled'] }
        }
      }
    ],
    group: ['product.category']
  });
  
  return categories.map(item => ({
    category: item.get('category'),
    revenue: parseFloat(item.get('revenue') || 0)
  }));
}

async function getRevenueEvolutionData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const data = await Order.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('SUM', sequelize.col('totalPrice')), 'revenue']
    ],
    where: {
      ...dateConditions,
      status: { [sequelize.Op.notIn]: ['cancelled'] }
    },
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });
  
  return data.map(item => ({
    date: item.get('date'),
    revenue: parseFloat(item.get('revenue') || 0)
  }));
}

async function getCustomerStatsData(startDate, endDate) {
  const dateConditions = buildDateConditions(startDate, endDate);
  
  const customerOrders = await Order.findAll({
    attributes: [
      'userId',
      [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
      [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSpent']
    ],
    where: {
      ...dateConditions,
      status: { [sequelize.Op.notIn]: ['cancelled'] }
    },
    group: ['userId']
  });
  
  let vipCustomers = 0;
  let vipRevenue = 0;
  
  customerOrders.forEach(item => {
    const orderCount = parseInt(item.get('orderCount') || 0);
    const totalSpent = parseFloat(item.get('totalSpent') || 0);
    
    if (orderCount >= 5 || totalSpent >= 500) {
      vipCustomers++;
      vipRevenue += totalSpent;
    }
  });
  
  return {
    totalCustomers: customerOrders.length,
    vipCustomers,
    vipRevenue
  };
}

function buildDateConditions(startDate, endDate) {
  const conditions = {};
  if (startDate) {
    conditions.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.createdAt = {
      ...conditions.createdAt,
      [sequelize.Op.lte]: end
    };
  }
  return conditions;
}