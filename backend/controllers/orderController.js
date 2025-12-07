import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const orderController = {
  // Créer une nouvelle commande
  async createOrder(req, res) {
    try {
      const { userId, items, deliveryInfo, payment } = req.body;
      
      // Calculer le total
      let totalPrice = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) throw new Error(`Produit ${item.productId} non trouvé`);
        
        totalPrice += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          name: product.name
        });
      }

      // Créer la commande
      const order = await Order.create({
        userId,
        totalPrice,
        paymentMethod: payment.method,
        paymentStatus: 'paid',
        shippingAddress: deliveryInfo.address,
        shippingMethod: deliveryInfo.option.carrier,
        status: 'confirmed',
        trackingNumber: generateTrackingNumber(deliveryInfo.option.carrier),
        estimatedDelivery: calculateDeliveryDate(deliveryInfo.option.deliveryTime)
      });

      // Créer les items de commande
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item
        });
      }

      // Mettre à jour les stocks
      for (const item of items) {
        await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId }
        });
      }

      res.status(201).json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          status: order.status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Récupérer une commande pour la confirmation
  async getOrderConfirmation(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image']
            }]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Commande non trouvée' });
      }

      res.json({ success: true, order });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Récupérer toutes les commandes pour l'admin
  async getAdminOrders(req, res) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const orders = await Order.findAndCountAll({
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
              attributes: ['id', 'name', 'sku']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        orders: orders.rows,
        total: orders.count,
        totalPages: Math.ceil(orders.count / parseInt(limit)),
        currentPage: parseInt(page)
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Commande non trouvée' });
      }

      // Si c'est une expédition, générer un numéro de suivi
      if (status === 'shipped' && !trackingNumber) {
        order.trackingNumber = generateTrackingNumber(order.shippingMethod);
      }

      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (status) order.status = status;
      if (notes) order.notes = notes;

      await order.save();

      // Envoyer un email de notification si nécessaire
      if (['shipped', 'delivered'].includes(status)) {
        await sendOrderUpdateEmail(order);
      }

      res.json({ success: true, order });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// Fonctions utilitaires
function generateTrackingNumber(carrier) {
  const prefixes = {
    'Colissimo': 'COL',
    'Chronopost': 'CHR',
    'Mondial Relay': 'MR',
    'UPS': 'UPS',
    'DHL': 'DHL'
  };
  
  const prefix = prefixes[carrier] || 'TRK';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}${timestamp.slice(-6)}${random.slice(0, 8)}`;
}

function calculateDeliveryDate(deliveryTime) {
  const days = parseInt(deliveryTime.match(/\d+/)[0]);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function sendOrderUpdateEmail(order) {
  // Implémentation de l'envoi d'email
  console.log(`Email envoyé pour la commande ${order.orderNumber}`);
}