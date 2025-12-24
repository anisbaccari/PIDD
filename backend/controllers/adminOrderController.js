// controllers/adminOrderController.js
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../database/mysql.js';

/**
 * Récupérer toutes les commandes avec filtres
 */
export async function getAllOrders(request, reply) {
  try {
    console.log(" ======[getAllOrders - ADMIN]=====");
    
    // Récupérer les paramètres de requête
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      startDate, 
      endDate,
      minAmount,
      maxAmount
    } = request.query;
    
    const offset = (page - 1) * limit;
    
    // Construire les conditions WHERE
    const whereConditions = {};
    
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    
    if (startDate) {
      whereConditions.createdAt = {
        [sequelize.Op.gte]: new Date(startDate)
      };
    }
    
    if (endDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    if (minAmount) {
      whereConditions.totalPrice = {
        [sequelize.Op.gte]: parseFloat(minAmount)
      };
    }
    
    if (maxAmount) {
      whereConditions.totalPrice = {
        ...whereConditions.totalPrice,
        [sequelize.Op.lte]: parseFloat(maxAmount)
      };
    }
    
    // Configuration des includes
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'name', 'lastName', 'address'],
        required: false
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'quantity', 'unitPrice'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'img', 'category']
        }]
      }
    ];
    
    // Recherche par texte
    if (search) {
      // Ajouter une condition de recherche sur l'utilisateur
      include[0] = {
        ...include[0],
        where: {
          [sequelize.Op.or]: [
            { email: { [sequelize.Op.like]: `%${search}%` } },
            { username: { [sequelize.Op.like]: `%${search}%` } },
            { name: { [sequelize.Op.like]: `%${search}%` } },
            { lastName: { [sequelize.Op.like]: `%${search}%` } }
          ]
        }
      };
      
      // Ajouter aussi une recherche sur le numéro de commande
      whereConditions[sequelize.Op.or] = [
        sequelize.where(
          sequelize.cast(sequelize.col('Order.id'), 'CHAR'),
          { [sequelize.Op.like]: `%${search}%` }
        )
      ];
    }
    
    console.log("Conditions de recherche:", whereConditions);
    
    // Récupérer les commandes avec pagination
    const result = await Order.findAndCountAll({
      where: whereConditions,
      include: include,
      distinct: true, // Important pour éviter les doublons avec les includes
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    console.log(`Résultat de findAndCountAll: ${result.count} commandes trouvées`);
    
    // Calculer les statistiques
 const stats = await calculateOrderStats(whereConditions);

    // Formater la réponse
    const formattedOrders = result.rows.map(order => formatOrder(order));
    
    console.log(`✅ ${formattedOrders.length} commandes formatées`);
    
    reply.send({
      success: true,
      orders: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        pages: Math.ceil(result.count / limit)
      },
      stats: stats
    });
    
  } catch (error) {
    console.error("❌ [getAllOrders - ADMIN] Erreur:", error);
    console.error("Détails de l'erreur:", error.stack);
    reply.status(500).send({
      success: false,
      error: "Erreur serveur lors du chargement des commandes"
    });
  }
}

/**
 * Calculer les statistiques des commandes
 */
async function calculateOrderStats(whereConditions = {}) {
  try {
    console.log('📊 Calcul des statistiques avec conditions:', whereConditions);

    // Total des commandes avec les filtres appliqués
    const totalOrders = await Order.count({
      where: whereConditions
    });

    console.log('📦 Total commandes:', totalOrders);

    // Commandes en attente avec filtres
    const pendingOrders = await Order.count({
      where: {
        ...whereConditions,
        status: 'pending'
      }
    });

    console.log('⏳ Commandes en attente:', pendingOrders);

    // 🔥 CORRECTION : Calcul du CA depuis OrderItem avec JOIN sur Order
    const revenueResult = await OrderItem.findOne({
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
          ...whereConditions,
          status: { [sequelize.Op.notIn]: ['cancelled'] }
        }
      }],
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);
    
    console.log('💰 Chiffre d\'affaires calculé:', totalRevenue);

    // Panier moyen
    const averageOrderValue = totalOrders > 0 
      ? totalRevenue / totalOrders 
      : 0;

    console.log('📊 Panier moyen:', averageOrderValue);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100
    };

  } catch (error) {
    console.error("❌ Erreur stats:", error.message);
    console.error("❌ Stack:", error.stack);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };
  }
}
/**
 * Formater une commande pour la réponse API
 */

function formatOrder(order) {
  const user = order.user || {};
  
  // Calcul précis du totalPrice
  const totalPrice = (order.items || []).reduce(
    (sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    },
    0
  );
  
  // Arrondi à 2 décimales
  const roundedTotalPrice = Math.round(totalPrice * 100) / 100;
  
  return {
    id: order.id,
    orderNumber: `CMD-${order.id.toString().padStart(6, '0')}`,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    totalPrice: roundedTotalPrice, // Utilisez le calcul précis

    // Informations client
    customer: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      fullName: `${user.name || ''} ${user.lastName || ''}`.trim() || 'Client',
      address: user.address
    },
    
    // Articles
    items: (order.items || []).map(item => {
      const product = item.product || {};
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const total = quantity * unitPrice;
      
      return {
        id: item.id,
        quantity: quantity,
        unitPrice: unitPrice,
        total: Math.round(total * 100) / 100,
        product: {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price || 0),
          img: product.img,
          category: product.category
        }
      };
    }),
    
    // Informations de livraison
    delivery: {
      method: 'Standard',
      address: user.address || 'Non spécifiée',
      trackingNumber: order.trackingNumber || null
    },
    
    // Informations de paiement
    payment: {
      method: 'Carte bancaire',
      transactionId: `TRX-${order.id}`
    }
  };
}
/**
 * Récupérer les détails d'une commande spécifique
 */
export async function getOrderDetails(request, reply) {
  try {
    const { orderId } = request.params;
    
    console.log(`=====[getOrderDetails] Commande ID: ${orderId}`);
    
    if (!orderId) {
      return reply.status(400).send({
        success: false,
        error: "ID de commande requis"
      });
    }
    
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'name', 'lastName', 'address']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'img', 'category', 'description']
          }]
        }
      ]
    });
    
    if (!order) {
      return reply.status(404).send({
        success: false,
        error: "Commande non trouvée"
      });
    }
    
    reply.send({
      success: true,
      order: formatOrder(order)
    });
    
  } catch (error) {
    console.error("❌ [getOrderDetails] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(request, reply) {
  try {
    const { orderId } = request.params;
    const { status, trackingNumber, notes } = request.body;
    
    console.log(`=====[updateOrderStatus] ID: ${orderId}, Status: ${status}`);
    
    if (!orderId || !status) {
      return reply.status(400).send({
        success: false,
        error: "ID de commande et statut requis"
      });
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({
        success: false,
        error: "Statut invalide"
      });
    }
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return reply.status(404).send({
        success: false,
        error: "Commande non trouvée"
      });
    }
    
    // Préparer les mises à jour
    const updates = { status };
    
    // Ajouter un champ trackingNumber si vous l'avez dans votre modèle
    // Si votre modèle n'a pas ce champ, vous pouvez l'ajouter ou utiliser le champ notes
    if (trackingNumber) {
      // Si votre modèle n'a pas trackingNumber, utilisez notes
      updates.notes = trackingNumber;
    }
    
    // Mettre à jour la commande
    await order.update(updates);
    
    // Récupérer la commande mise à jour avec les relations
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'lastName']
        }
      ]
    });
    
    console.log(`✅ Statut mis à jour pour la commande ${orderId}`);
    
    reply.send({
      success: true,
      message: "Statut mis à jour avec succès",
      order: formatOrder(updatedOrder)
    });
    
  } catch (error) {
    console.error("❌ [updateOrderStatus] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Mise à jour en masse du statut
 */
export async function updateBulkOrderStatus(request, reply) {
  try {
    const { orderIds, status, notes } = request.body;
    
    console.log(`=====[updateBulkOrderStatus] IDs: ${orderIds}, Status: ${status}`);
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return reply.status(400).send({
        success: false,
        error: "Liste d'IDs et statut requis"
      });
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({
        success: false,
        error: "Statut invalide"
      });
    }
    
    let updatedCount = 0;
    
    // Mettre à jour chaque commande
    for (const orderId of orderIds) {
      const order = await Order.findByPk(orderId);
      
      if (order) {
        await order.update({ status });
        updatedCount++;
        console.log(`✅ Commande ${orderId} mise à jour`);
      }
    }
    
    reply.send({
      success: true,
      message: `${updatedCount} commande(s) mises à jour`,
      updatedCount: updatedCount
    });
    
  } catch (error) {
    console.error("❌ [updateBulkOrderStatus] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Exporter les commandes en CSV
 */
export async function exportOrders(request, reply) {
  try {
    const { format = 'csv', startDate, endDate, status } = request.query;
    
    console.log(`=====[exportOrders] Format: ${format}, Status: ${status}`);
    
    // Récupérer les commandes à exporter
    const whereConditions = {};
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    if (startDate) {
      whereConditions.createdAt = { [sequelize.Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      whereConditions.createdAt = { [sequelize.Op.lte]: new Date(endDate) };
    }
    
    const orders = await Order.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'name', 'lastName', 'address']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'category']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Formater pour CSV
    const csvData = formatOrdersForCSV(orders);
    
    // Définir les en-têtes pour le téléchargement
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename=commandes_${new Date().toISOString().split('T')[0]}.csv`);
    
    reply.send(csvData);
    
  } catch (error) {
    console.error("❌ [exportOrders] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Supprimer une commande
 */
export async function deleteOrder(request, reply) {
  try {
    const { orderId } = request.params;
    
    console.log(`=====[deleteOrder] ID: ${orderId}`);
    
    if (!orderId) {
      return reply.status(400).send({
        success: false,
        error: "ID de commande requis"
      });
    }
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return reply.status(404).send({
        success: false,
        error: "Commande non trouvée"
      });
    }
    
    // Ne supprimer que les commandes annulées ou en attente
    if (!['pending', 'cancelled'].includes(order.status)) {
      return reply.status(400).send({
        success: false,
        error: "Impossible de supprimer une commande avec ce statut"
      });
    }
    
    // Supprimer d'abord les items associés
    await OrderItem.destroy({
      where: { orderId: orderId }
    });
    
    // Supprimer la commande
    await order.destroy();
    
    reply.send({
      success: true,
      message: "Commande supprimée avec succès"
    });
    
  } catch (error) {
    console.error("❌ [deleteOrder] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Helper: Formater les commandes pour CSV
 */
function formatOrdersForCSV(orders) {
  const headers = [
    'Numéro',
    'Date',
    'Client',
    'Email',
    'Statut',
    'Montant total',
    'Articles'
  ].join(';');
  
  const rows = orders.map(order => {
    const user = order.user || {};
    const customerName = `${user.name || ''} ${user.lastName || ''}`.trim() || 'Client';
    const email = user.email || 'N/A';
    
    // Articles sous forme de liste
    const items = (order.items || []).map(item => {
      const product = item.product || {};
      return `${product.name || 'Produit'} (x${item.quantity}) - ${parseFloat(item.unitPrice || 0).toFixed(2)}€`;
    }).join(' | ') || 'Aucun article';
    
    return [
      `CMD-${order.id}`,
      order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A',
      `"${customerName}"`,
      `"${email}"`,
      order.status,
      `${parseFloat(order.totalPrice || 0).toFixed(2)}€`,
      `"${items}"`
    ].join(';');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * Vérifier si le modèle OrderItem existe
 * Si non, le définir ici temporairement
 */
if (!OrderItem) {
  // Définition temporaire du modèle OrderItem
  const { DataTypes } = await import('sequelize');
  
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'order_items'
  });
  
  // Définir les relations
  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
  });
  
  OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
  });
  
  Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
  });
  
  Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems'
  });
  
  console.log("⚠️  Modèle OrderItem défini temporairement dans le contrôleur");
}