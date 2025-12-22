// ============================================
// controllers/adminOrderController.js
// ============================================
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

// GET /api/orders/admin - Récupérer toutes les commandes (avec filtres)
export async function getAllOrders(request, reply) {
  try {
    console.log('======================== [getAllOrders] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    // Paramètres de pagination et filtres
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      startDate,
      endDate
    } = request.query;

    // Construction des conditions WHERE
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    }

    // Récupérer les commandes avec includes
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'name', 'lastName', 'address']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'img', 'brand']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Filtrer par recherche si nécessaire
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(order => {
        const orderData = order.get({ plain: true });
        return (
          orderData.orderNumber?.toLowerCase().includes(searchLower) ||
          orderData.user?.username?.toLowerCase().includes(searchLower) ||
          orderData.user?.email?.toLowerCase().includes(searchLower) ||
          orderData.user?.name?.toLowerCase().includes(searchLower) ||
          orderData.user?.lastName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Calculer les statistiques sur TOUTES les commandes
    const allOrders = await Order.findAll({
      attributes: ['id', 'totalPrice', 'status', 'createdAt']
    });

    const stats = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0),
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      confirmedOrders: allOrders.filter(o => o.status === 'confirmed').length,
      processingOrders: allOrders.filter(o => o.status === 'processing').length,
      shippedOrders: allOrders.filter(o => o.status === 'shipped').length,
      deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
      cancelledOrders: allOrders.filter(o => o.status === 'cancelled').length,
      averageOrderValue: allOrders.length > 0 
        ? allOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0) / allOrders.length 
        : 0
    };

    console.log(`✅ ${filteredOrders.length} commandes récupérées`);

    reply.send({
      success: true,
      orders: filteredOrders.map(o => o.get({ plain: true })),
      stats,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('[getAllOrders] Erreur:', error);
    reply.code(500).send({ error: 'Server error', details: error.message });
  }
}

// GET /api/orders/admin/export - Exporter les commandes en CSV
export async function exportOrders(request, reply) {
  try {
    console.log('======================== [exportOrders] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    // Récupérer toutes les commandes
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'name', 'lastName']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Générer le CSV avec encodage UTF-8
    const headers = ['Numéro Commande', 'Client', 'Email', 'Date', 'Montant', 'Statut', 'Paiement', 'Articles'];
    const rows = orders.map(order => {
      const orderData = order.get({ plain: true });
      const customerName = `${orderData.user?.name || ''} ${orderData.user?.lastName || ''}`.trim() || orderData.user?.username || 'Client';
      const products = orderData.items?.map(item => `${item.product?.name || 'Produit'} (x${item.quantity})`).join('; ') || '';
      
      return [
        orderData.orderNumber || `CMD-${orderData.id}`,
        customerName,
        orderData.user?.email || '',
        new Date(orderData.createdAt).toLocaleDateString('fr-FR'),
        parseFloat(orderData.totalPrice).toFixed(2),
        orderData.status,
        orderData.paymentStatus || 'N/A',
        products
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="commandes_${new Date().toISOString().split('T')[0]}.csv"`)
      .send('\uFEFF' + csv); // BOM UTF-8 pour Excel

  } catch (error) {
    console.error('[exportOrders] Erreur:', error);
    reply.code(500).send({ error: 'Server error' });
  }
}

// PUT /api/orders/:orderId/status - Mettre à jour le statut d'une commande
export async function updateOrderStatus(request, reply) {
  try {
    console.log('======================== [updateOrderStatus] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    const { orderId } = request.params;
    const { status, trackingNumber, notes } = request.body;

    // Valider le statut
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return reply.code(404).send({ error: 'Order not found' });
    }

    // Mettre à jour le statut
    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    // Si expédié, mettre une date de livraison estimée (3 jours ouvrés)
    if (status === 'shipped' && !order.estimatedDelivery) {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3);
      order.estimatedDelivery = estimatedDate;
    }

    // Si confirmé, mettre à jour le statut de paiement
    if (status === 'confirmed' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    console.log(`✅ Commande ${orderId} mise à jour - Statut: ${status}`);

    reply.send({
      success: true,
      order: order.get({ plain: true })
    });

  } catch (error) {
    console.error('[updateOrderStatus] Erreur:', error);
    reply.code(500).send({ error: 'Server error', details: error.message });
  }
}

// PUT /api/orders/bulk/status - Mettre à jour plusieurs commandes
export async function updateBulkOrderStatus(request, reply) {
  try {
    console.log('======================== [updateBulkOrderStatus] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    const { orderIds, status } = request.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return reply.code(400).send({ error: 'Order IDs required' });
    }

    if (!status) {
      return reply.code(400).send({ error: 'Status required' });
    }

    // Valider le statut
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ error: 'Invalid status' });
    }

    // Préparer les données de mise à jour
    const updateData = { status };
    
    if (status === 'shipped') {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3);
      updateData.estimatedDelivery = estimatedDate;
    }

    if (status === 'confirmed') {
      updateData.paymentStatus = 'paid';
    }

    // Mettre à jour toutes les commandes
    const [updatedCount] = await Order.update(updateData, {
      where: {
        id: {
          [Op.in]: orderIds
        }
      }
    });

    console.log(`✅ ${updatedCount} commandes mises à jour`);

    reply.send({
      success: true,
      updated: updatedCount
    });

  } catch (error) {
    console.error('[updateBulkOrderStatus] Erreur:', error);
    reply.code(500).send({ error: 'Server error', details: error.message });
  }
}

// DELETE /api/orders/:orderId - Supprimer une commande
export async function deleteOrder(request, reply) {
  try {
    console.log('======================== [deleteOrder] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    const { orderId } = request.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return reply.code(404).send({ error: 'Order not found' });
    }

    // Supprimer les items associés (cascade devrait le faire automatiquement)
    await OrderItem.destroy({ where: { orderId } });
    
    // Supprimer la commande
    await order.destroy();

    console.log(`✅ Commande ${orderId} supprimée`);

    reply.send({ success: true });

  } catch (error) {
    console.error('[deleteOrder] Erreur:', error);
    reply.code(500).send({ error: 'Server error', details: error.message });
  }
}

// GET /api/orders/:orderId - Détails d'une commande
export async function getOrderDetails(request, reply) {
  try {
    console.log('======================== [getOrderDetails] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return reply.code(403).send({ error: 'Accès réservé aux administrateurs' });
    }

    const { orderId } = request.params;

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
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'img', 'brand', 'description']
            }
          ]
        }
      ]
    });

    if (!order) {
      return reply.code(404).send({ error: 'Order not found' });
    }

    reply.send({
      success: true,
      order: order.get({ plain: true })
    });

  } catch (error) {
    console.error('[getOrderDetails] Erreur:', error);
    reply.code(500).send({ error: 'Server error', details: error.message });
  }
}