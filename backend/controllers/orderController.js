// backend/controllers/orderController.js
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

export const orderController = {
  // ========== CRÉATION DE COMMANDE ==========
  async createOrder(req, res) {
    try {
      const { userId, items, deliveryInfo, payment } = req.body;
      
      // Validation
      if (!userId || !items || items.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Données de commande incomplètes' 
        });
      }

      // Vérifier l'existence de l'utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        });
      }

      // Calculer le total et vérifier les stocks
      let totalPrice = 0;
      let subtotal = 0;
      let shipping = deliveryInfo?.option?.cost || 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(404).json({ 
            success: false, 
            error: `Produit ${item.productId} non trouvé` 
          });
        }
        
        // Vérifier le stock
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Stock insuffisant pour ${product.name}. Disponible: ${product.quantity}, Demandé: ${item.quantity}`
          });
        }

        const itemPrice = product.price * item.quantity;
        subtotal += itemPrice;
        
        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.img,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemPrice
        });
      }

      totalPrice = subtotal + shipping;

      // Générer un numéro de commande unique
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Créer la commande dans la base de données
      const order = await Order.create({
        userId,
        orderNumber,
        totalPrice,
        subtotal,
        shipping,
        paymentMethod: payment?.method || 'card',
        paymentStatus: 'paid',
        shippingAddress: deliveryInfo?.address || '',
        shippingMethod: deliveryInfo?.option?.carrier || 'Standard',
        shippingCost: shipping,
        status: 'confirmed',
        trackingNumber: deliveryInfo?.option?.trackingNumber || generateTrackingNumber(deliveryInfo?.option?.carrier),
        estimatedDelivery: calculateDeliveryDate(deliveryInfo?.option?.deliveryTime),
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone || ''
      });

      // Créer les items de commande
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item
        });
      }

      // Mettre à jour les stocks des produits
      for (const item of items) {
        await Product.decrement('quantity', {
          by: item.quantity,
          where: { id: item.productId }
        });
      }

      // Envoyer une confirmation par email
      await sendOrderConfirmationEmail(order, user.email);

      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          status: order.status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt
        }
      });

    } catch (error) {
      console.error('[createOrder] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la création de la commande' 
      });
    }
  },

  // ========== RÉCUPÉRATION DE COMMANDE POUR CONFIRMATION ==========
  async getOrderConfirmation(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items'
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Commande non trouvée' 
        });
      }

      res.json({ 
        success: true, 
        order 
      });
      
    } catch (error) {
      console.error('[getOrderConfirmation] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération de la commande' 
      });
    }
  },

  // ========== COMMANDES POUR ADMIN ==========
  async getAdminOrders(req, res) {
    try {
      const { 
        status, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10,
        search 
      } = req.query;
      
      const where = {};
      
      // Filtrage par statut
      if (status && status !== 'all') {
        where.status = status;
      }
      
      // Filtrage par date
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      // Recherche par nom client ou numéro de commande
      if (search) {
        where[Op.or] = [
          { orderNumber: { [Op.like]: `%${search}%` } },
          { customerName: { [Op.like]: `%${search}%` } },
          { customerEmail: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'img']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      // Calculer les statistiques
      const totalOrders = await Order.count();
      const totalRevenue = await Order.sum('totalPrice');
      const confirmedOrders = await Order.count({ where: { status: 'confirmed' } });
      const shippedOrders = await Order.count({ where: { status: 'shipped' } });
      const deliveredOrders = await Order.count({ where: { status: 'delivered' } });

      res.json({
        success: true,
        orders,
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        stats: {
          totalOrders,
          totalRevenue: totalRevenue || 0,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          averageOrderValue: totalRevenue ? totalRevenue / totalOrders : 0
        }
      });
      
    } catch (error) {
      console.error('[getAdminOrders] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des commandes' 
      });
    }
  },

  // ========== MISE À JOUR STATUT COMMANDE ==========
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const order = await Order.findByPk(orderId, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['email', 'firstName', 'lastName']
        }]
      });
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Commande non trouvée' 
        });
      }

      // Si c'est une expédition, générer un numéro de suivi si non fourni
      if (status === 'shipped' && !trackingNumber) {
        order.trackingNumber = generateTrackingNumber(order.shippingMethod);
      }

      // Mettre à jour les champs
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (status) order.status = status;
      if (notes) order.notes = notes;

      await order.save();

      // Envoyer un email de notification si le statut change
      if (['shipped', 'delivered', 'cancelled'].includes(status)) {
        await sendOrderStatusUpdateEmail(order);
      }

      res.json({ 
        success: true, 
        message: 'Statut mis à jour avec succès',
        order 
      });
      
    } catch (error) {
      console.error('[updateOrderStatus] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour du statut' 
      });
    }
  },

  // ========== SUPPRESSION COMMANDE ==========
  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Commande non trouvée' 
        });
      }

      // Vérifier si la commande peut être supprimée
      if (order.status === 'shipped' || order.status === 'delivered') {
        return res.status(400).json({
          success: false,
          error: 'Impossible de supprimer une commande déjà expédiée ou livrée'
        });
      }

      // Rétablir les stocks si la commande est annulée
      if (order.status === 'confirmed') {
        const orderItems = await OrderItem.findAll({ 
          where: { orderId: order.id } 
        });
        
        for (const item of orderItems) {
          await Product.increment('quantity', {
            by: item.quantity,
            where: { id: item.productId }
          });
        }
      }

      // Supprimer les items de commande d'abord
      await OrderItem.destroy({ where: { orderId: order.id } });
      
      // Puis supprimer la commande
      await order.destroy();

      res.json({ 
        success: true, 
        message: 'Commande supprimée avec succès' 
      });
      
    } catch (error) {
      console.error('[deleteOrder] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la suppression de la commande' 
      });
    }
  },

  // ========== COMMANDES PAR UTILISATEUR ==========
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      
      const orders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'img', 'price']
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ 
        success: true, 
        orders 
      });
      
    } catch (error) {
      console.error('[getUserOrders] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des commandes' 
      });
    }
  },

  // ========== STATISTIQUES COMMANDES ==========
  async getOrderStats(req, res) {
    try {
      const { period = 'month' } = req.query;
      const now = new Date();
      let startDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const orders = await Order.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'revenue']
        ],
        group: ['status']
      });

      const totalOrders = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        }
      });

      const totalRevenue = await Order.sum('totalPrice', {
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        }
      });

      res.json({
        success: true,
        stats: {
          totalOrders,
          totalRevenue: totalRevenue || 0,
          averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
          byStatus: orders
        }
      });
      
    } catch (error) {
      console.error('[getOrderStats] error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      });
    }
  }
};

// ========== FONCTIONS UTILITAIRES ==========
function generateTrackingNumber(carrier) {
  const prefixes = {
    'Colissimo': 'COL',
    'Chronopost': 'CHR',
    'Mondial Relay': 'MR',
    'UPS': 'UPS',
    'DHL': 'DHL',
    'Standard': 'STD'
  };
  
  const prefix = prefixes[carrier] || 'TRK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}${timestamp.slice(-6)}${random}`;
}

function calculateDeliveryDate(deliveryTime) {
  if (!deliveryTime) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 5); // 5 jours par défaut
    return defaultDate;
  }

  const days = parseInt(deliveryTime.match(/\d+/)?.[0] || '5');
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
async updateBulkStatus(req, res) {
  try {
    const { orderIds, status } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Liste d\'IDs de commandes requise' 
      });
    }
    
    if (!status || !['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Statut invalide' 
      });
    }
    
    // Mettre à jour toutes les commandes
    await Order.update(
      { status },
      {
        where: {
          id: {
            [Op.in]: orderIds
          }
        }
      }
    );
    
    // Récupérer les commandes mises à jour
    const updatedOrders = await Order.findAll({
      where: {
        id: {
          [Op.in]: orderIds
        }
      },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });
    
    res.json({
      success: true,
      message: `${updatedOrders.length} commande(s) mises à jour`,
      orders: updatedOrders
    });
    
  } catch (error) {
    console.error('[updateBulkStatus] error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour groupée' 
    });
  }
}
async function sendOrderConfirmationEmail(order, email) {
  // Implémentation de l'envoi d'email de confirmation
  console.log(`📧 Email de confirmation envoyé pour la commande ${order.orderNumber} à ${email}`);
  
  // Exemple d'implémentation avec nodemailer :
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmation de commande #${order.orderNumber}`,
    html: `<h1>Merci pour votre commande !</h1>`
  };
  
  await transporter.sendMail(mailOptions);
  */
}

async function sendOrderStatusUpdateEmail(order) {
  // Implémentation de l'envoi d'email de mise à jour de statut
  console.log(`📧 Email de mise à jour envoyé pour la commande ${order.orderNumber}`);
  
  // Similaire à sendOrderConfirmationEmail mais avec un message différent
}