// controllers/adminOrderController.js
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { OrderItem } from '../models/OrderItem.js';
import { sequelize } from '../database/mysql.js';
import { Op } from 'sequelize'; // IMPORTANT: Importer Op

/**
 * Récupérer toutes les commandes avec filtres
 */
export async function getAllOrders(request, reply) {
  try {
    console.log("📦 ======[getAllOrders - ADMIN]=====");
    
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
        [Op.gte]: new Date(startDate)
      };
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: end
      };
    }
    
    if (minAmount) {
      whereConditions.totalPrice = {
        [Op.gte]: parseFloat(minAmount)
      };
    }
    
    if (maxAmount) {
      whereConditions.totalPrice = {
        ...whereConditions.totalPrice,
        [Op.lte]: parseFloat(maxAmount)
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
      const searchConditions = {
        [Op.or]: [
          // Recherche dans les commandes
          sequelize.where(
            sequelize.cast(sequelize.col('Order.id'), 'CHAR'),
            { [Op.like]: `%${search}%` }
          ),
          // Recherche dans les utilisateurs via sous-requête
          sequelize.literal(`EXISTS (
            SELECT 1 FROM users WHERE users.id = Order.userId 
            AND (
              users.email LIKE '%${search}%' 
              OR users.username LIKE '%${search}%'
              OR CONCAT(users.name, ' ', users.lastName) LIKE '%${search}%'
              OR users.name LIKE '%${search}%'
              OR users.lastName LIKE '%${search}%'
            )
          )`)
        ]
      };
      
      // Si vous voulez toujours charger les données utilisateur même en cas de recherche
      whereConditions[Op.and] = [
        searchConditions,
        ...(whereConditions[Op.and] || [])
      ];
    }
    
    console.log("🔍 Conditions de recherche:", whereConditions);
    
    // Récupérer les commandes avec pagination
    const result = await Order.findAndCountAll({
      where: whereConditions,
      include: include,
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    console.log(`✅ ${result.count} commandes trouvées`);
    
    // Calculer les statistiques
    const stats = await calculateOrderStats(whereConditions);
    
    // Formater la réponse
    const formattedOrders = result.rows.map(order => formatOrder(order));
    
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
    reply.status(500).send({
      success: false,
      error: "Erreur serveur lors du chargement des commandes",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Commandes en attente avec filtres
    const pendingOrders = await Order.count({
      where: {
        ...whereConditions,
        status: 'pending'
      }
    });

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
          status: { [Op.notIn]: ['cancelled'] }
        }
      }],
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);
    
    // Panier moyen
    const averageOrderValue = totalOrders > 0 
      ? totalRevenue / totalOrders 
      : 0;

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100
    };

  } catch (error) {
    console.error("❌ Erreur stats:", error.message);
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
  
  // Créer le nom complet du client
  let fullName = 'Client';
  if (user.name || user.lastName) {
    fullName = `${user.name || ''} ${user.lastName || ''}`.trim();
  } else if (user.username) {
    fullName = user.username;
  }
  
  return {
    id: order.id,
    orderNumber: `CMD-${order.id.toString().padStart(6, '0')}`,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    totalPrice: roundedTotalPrice,
    
    // Informations client
    customer: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      fullName: fullName,
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
          name: product.name || `Produit #${product.id}`,
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
      transactionId: `TRX-${order.id}`,
      status: order.status === 'pending' ? 'En attente' : 'Payé'
    }
  };
}

/**
 * Récupérer les détails d'une commande spécifique
 */
export async function getOrderDetails(request, reply) {
  try {
    const { orderId } = request.params;
    
    console.log(`🔍 [getOrderDetails] Commande ID: ${orderId}`);
    
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
          attributes: ['id', 'username', 'email', 'name', 'lastName', 'address', 'phone']
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
    
    console.log(`🔄 [updateOrderStatus] ID: ${orderId}, Status: ${status}`);
    
    if (!orderId || !status) {
      return reply.status(400).send({
        success: false,
        error: "ID de commande et statut requis"
      });
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'paid', 'cancelled'];
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
    
    // Ajouter trackingNumber si disponible dans le modèle
    if (trackingNumber) {
      // Vérifier si le modèle a un champ trackingNumber
      if (Order.rawAttributes.trackingNumber) {
        updates.trackingNumber = trackingNumber;
      } else {
        // Sinon, utiliser un champ notes ou créér un objet metadata
        updates.metadata = {
          ...(order.metadata || {}),
          trackingNumber,
          updatedAt: new Date()
        };
      }
    }
    
    if (notes) {
      updates.notes = notes;
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
    
    console.log(`🔄 [updateBulkOrderStatus] IDs: ${orderIds.length}, Status: ${status}`);
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return reply.status(400).send({
        success: false,
        error: "Liste d'IDs et statut requis"
      });
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'paid',  'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({
        success: false,
        error: "Statut invalide"
      });
    }
    
    // Mise à jour en masse avec Sequelize
    const [updatedCount] = await Order.update(
      { status, updatedAt: new Date() },
      {
        where: {
          id: { [Op.in]: orderIds }
        }
      }
    );
    
    console.log(`✅ ${updatedCount} commande(s) mises à jour`);
    
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
    
    console.log(`📤 [exportOrders] Format: ${format}, Status: ${status}`);
    
    // Récupérer les commandes à exporter
    const whereConditions = {};
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereConditions.createdAt = { [Op.gte]: start };
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: end
      };
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
    
    console.log(`🗑️ [deleteOrder] ID: ${orderId}`);
    
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
    
    // Vérification de sécurité - ne supprimer que certaines commandes
    const deletableStatuses = ['pending', 'cancelled'];
    if (!deletableStatuses.includes(order.status)) {
      return reply.status(400).send({
        success: false,
        error: "Impossible de supprimer une commande avec ce statut"
      });
    }
    
    // Utiliser une transaction pour garantir l'intégrité des données
    const transaction = await sequelize.transaction();
    
    try {
      // Supprimer d'abord les items associés
      await OrderItem.destroy({
        where: { orderId: orderId },
        transaction
      });
      
      // Supprimer la commande
      await order.destroy({ transaction });
      
      // Valider la transaction
      await transaction.commit();
      
      reply.send({
        success: true,
        message: "Commande supprimée avec succès"
      });
      
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
    
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
    'Articles',
    'Adresse'
  ].join(';');
  
  const rows = orders.map(order => {
    const user = order.user || {};
    const customerName = `${user.name || ''} ${user.lastName || ''}`.trim() || 'Client';
    const email = user.email || 'N/A';
    const address = user.address || 'Non spécifiée';
    
    // Calcul du montant total
    const totalAmount = (order.items || []).reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
    }, 0).toFixed(2);
    
    // Articles sous forme de liste
    const items = (order.items || []).map(item => {
      const product = item.product || {};
      const quantity = parseInt(item.quantity || 0);
      const unitPrice = parseFloat(item.unitPrice || 0);
      const total = (quantity * unitPrice).toFixed(2);
      
      return `${product.name || 'Produit'} (x${quantity}) - ${unitPrice.toFixed(2)}€ = ${total}€`;
    }).join(' | ') || 'Aucun article';
    
    const formattedDate = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';
    
    return [
      `CMD-${order.id}`,
      formattedDate,
      `"${customerName}"`,
      `"${email}"`,
      order.status,
      `${totalAmount}€`,
      `"${items}"`,
      `"${address}"`
    ].join(';');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * Statistiques générales pour le dashboard
 */
export async function getOrdersStats(request, reply) {
  try {
    console.log('📊 [getOrdersStats]');
    
    // Dernières 24 heures
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    
    // Cette semaine
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const stats = await Promise.all([
      // Total général
      Order.count(),
      
      // Commandes aujourd'hui
      Order.count({
        where: {
          createdAt: { [Op.gte]: last24h }
        }
      }),
      
      // Commandes cette semaine
      Order.count({
        where: {
          createdAt: { [Op.gte]: startOfWeek }
        }
      }),
      
      // Commandes ce mois
      Order.count({
        where: {
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      
      // CA total
      OrderItem.findOne({
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
            status: { [Op.notIn]: ['cancelled'] }
          }
        }],
        raw: true
      }),
      
      // Commandes par statut
      Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })
    ]);
    
    const totalOrders = stats[0];
    const todayOrders = stats[1];
    const weekOrders = stats[2];
    const monthOrders = stats[3];
    const totalRevenue = parseFloat(stats[4]?.totalRevenue || 0);
    const ordersByStatus = stats[5].reduce((acc, item) => {
      acc[item.status] = parseInt(item.get('count') || 0);
      return acc;
    }, {});
    
    reply.send({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersByStatus,
        averageOrderValue: totalOrders > 0 
          ? Math.round((totalRevenue / totalOrders) * 100) / 100 
          : 0
      }
    });
    
  } catch (error) {
    console.error("❌ [getOrdersStats] Erreur:", error);
    reply.status(500).send({
      success: false,
      error: error.message
    });
  }
}