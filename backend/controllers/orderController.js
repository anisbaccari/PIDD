// backend/controllers/orderController.js
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Op, sequelize } from 'sequelize';

export const orderController = {

  // ===================== CRÉATION DE COMMANDE =====================
  async createOrder(req, res) {
    try {
      const { userId, items, deliveryInfo, payment } = req.body;

      if (!userId || !items || items.length === 0) {
        return res.status(400).json({ success: false, error: "Données de commande incomplètes" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
      }

      let subtotal = 0;
      const shipping = deliveryInfo?.option?.cost || 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, error: `Produit ${item.productId} non trouvé` });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Stock insuffisant pour ${product.name}`
          });
        }

        const price = product.price * item.quantity;
        subtotal += price;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.img,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: price
        });
      }

      const totalPrice = subtotal + shipping;

      const orderNumber =
        `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const order = await Order.create({
        userId,
        orderNumber,
        subtotal,
        shipping,
        totalPrice,
        paymentMethod: payment?.method || "card",
        paymentStatus: "paid",
        shippingAddress: deliveryInfo?.address || "",
        shippingMethod: deliveryInfo?.option?.carrier || "Standard",
        shippingCost: shipping,
        status: "confirmed",
        trackingNumber: deliveryInfo?.option?.trackingNumber ||
          generateTrackingNumber(deliveryInfo?.option?.carrier),
        estimatedDelivery: calculateDeliveryDate(deliveryInfo?.option?.deliveryTime),
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone || ""
      });

      for (const item of orderItems) {
        await OrderItem.create({ orderId: order.id, ...item });
      }

      for (const item of items) {
        await Product.decrement('quantity', {
          by: item.quantity,
          where: { id: item.productId }
        });
      }

      await sendOrderConfirmationEmail(order, user.email);

      res.status(201).json({
        success: true,
        message: "Commande créée avec succès",
        order
      });

    } catch (error) {
      console.error("[createOrder] error:", error);
      res.status(500).json({ success: false, error: "Erreur lors de la création de la commande" });
    }
  },

  // ===================== RÉCUPÉRATION COMMANDE =====================
  async getOrderConfirmation(req, res) {
    try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId, {
        include: [
          { model: User, as: "user" },
          { model: OrderItem, as: "items" }
        ]
      });

      if (!order) {
        return res.status(404).json({ success: false, error: "Commande non trouvée" });
      }

      res.json({ success: true, order });

    } catch (error) {
      console.error("[getOrderConfirmation] error:", error);
      res.status(500).json({ success: false, error: "Erreur lors de la récupération" });
    }
  },

  // ===================== COMMANDES ADMIN =====================
  async getAdminOrders(req, res) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10, search } = req.query;
      const where = {};

      if (status && status !== 'all') where.status = status;

      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      if (search) {
        where[Op.or] = [
          { orderNumber: { [Op.like]: `%${search}%` } },
          { customerName: { [Op.like]: `%${search}%` } },
          { customerEmail: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          { model: User, as: "user" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }]
          }
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["createdAt", "DESC"]]
      });

      res.json({
        success: true,
        orders: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });

    } catch (error) {
      console.error("[getAdminOrders] error:", error);
      res.status(500).json({ success: false, error: "Erreur récupération admin" });
    }
  },

  // ===================== UPDATE STATUT (UNIQUE) =====================
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const order = await Order.findByPk(orderId, { include: ['user'] });

      if (!order) {
        return res.status(404).json({ success: false, error: "Commande non trouvée" });
      }

      if (status === "shipped" && !trackingNumber) {
        order.trackingNumber = generateTrackingNumber(order.shippingMethod);
      }

      if (status) order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (notes) order.notes = notes;

      await order.save();

      if (['shipped', 'delivered', 'cancelled'].includes(status)) {
        await sendOrderStatusUpdateEmail(order);
      }

      res.json({ success: true, order });

    } catch (error) {
      console.error("[updateOrderStatus] error:", error);
      res.status(500).json({ success: false, error: "Erreur mise à jour statut" });
    }
  },

  // ===================== UPDATE GROUPÉ (BULK) =====================
  async updateBulkStatus(req, res) {
    try {
      const { orderIds, status } = req.body;

      if (!orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ success: false, error: "Liste d'IDs invalide" });
      }

      if (!status) {
        return res.status(400).json({ success: false, error: "Statut manquant" });
      }

      await Order.update(
        { status },
        {
          where: {
            id: { [Op.in]: orderIds }
          }
        }
      );

      const updatedOrders = await Order.findAll({
        where: { id: { [Op.in]: orderIds } },
        include: ['items']
      });

      res.json({
        success: true,
        message: `${updatedOrders.length} commande(s) mise(s) à jour`,
        orders: updatedOrders
      });

    } catch (error) {
      console.error("[updateBulkStatus] error:", error);
      res.status(500).json({ success: false, error: "Erreur mise à jour groupée" });
    }
  },

  // ===================== COMMANDES UTILISATEUR =====================
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;

      const orders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        }],
        order: [["createdAt", "DESC"]]
      });

      res.json({ success: true, orders });

    } catch (error) {
      console.error("[getUserOrders] error:", error);
      res.status(500).json({ success: false, error: "Erreur récupération commandes utilisateur" });
    }
  }

};

// ========================================================================
// ======================== FONCTIONS UTILITAIRES =========================
// ========================================================================

function generateTrackingNumber(carrier) {
  const prefixes = {
    Colissimo: "COL",
    Chronopost: "CHR",
    "Mondial Relay": "MR",
    UPS: "UPS",
    DHL: "DHL",
    Standard: "STD"
  };

  const prefix = prefixes[carrier] || "TRK";
  return `${prefix}${Date.now().toString(36).slice(-6).toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

function calculateDeliveryDate(days) {
  const d = new Date();
  const nb = parseInt(days?.match(/\d+/)?.[0] || "5");
  d.setDate(d.getDate() + nb);
  return d;
}

async function sendOrderConfirmationEmail(order, email) {
  console.log(`📧 Email confirmation envoyé → ${email} (commande ${order.orderNumber})`);
}

async function sendOrderStatusUpdateEmail(order) {
  console.log(`📧 Email status update envoyé → commande ${order.orderNumber}`);
}
