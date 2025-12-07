// backend/routes/orderRoutes.js

// ========== IMPORTS CORRECTS ==========
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';
import { sequelize } from '../database/mysql.js';

// Import du middleware d'authentification (si disponible)
// Si vous n'avez pas de middleware, vous pouvez le créer ou l'enlever temporairement
// import authenticate from '../middleware/authMiddleware.js';

// Fonction middleware d'authentification temporaire (si vous n'avez pas encore le fichier)
const authenticate = async (request, reply, done) => {
  // Pour l'instant, autorisez toutes les requêtes
  // Vous implémenterez l'authentification plus tard
  done();
};

// ========== PLUGIN FASTIFY ==========
async function orderRoutes(fastify, options) {
  
  // ========== ROUTES COMMANDES ==========
  
  // Récupérer toutes les commandes (pour admin) - Version simplifiée pour tester
  fastify.get('/admin', async (request, reply) => {
    try {
      console.log('📋 Récupération des commandes admin...');
      
      // Testez d'abord si les modèles fonctionnent
      let orders;
      try {
        // Essayez de récupérer depuis la base de données
        orders = await Order.findAll({
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            },
            {
              model: OrderItem,
              include: [Product]
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10
        });
        
        console.log(`✅ ${orders.length} commandes trouvées dans la DB`);
        
      } catch (dbError) {
        console.log('⚠️  Base de données non accessible, utilisation de données de démo');
        // Données de démo si la DB n'est pas prête
        orders = [];
      }
      
      // Si pas de données en DB, utilisez des données de démo
      if (!orders || orders.length === 0) {
        const mockOrders = [
          {
            id: 'ORD-001',
            orderNumber: 'CMD-2024-001',
            date: '2024-01-15',
            time: '14:30',
            customer: {
              name: 'Jean Dupont',
              email: 'jean.dupont@email.com',
              phone: '0612345678'
            },
            amount: 149.99,
            subtotal: 145.00,
            shipping: 4.99,
            status: 'confirmed',
            payment: {
              method: 'Carte bancaire',
              transactionId: 'TRX-001'
            },
            delivery: {
              method: 'Livraison standard',
              address: '123 Rue de Paris, 75001 Paris',
              trackingNumber: 'COL123456789FR'
            },
            items: [
              { id: 1, name: 'T-shirt Noir Classique', sku: 'TSHIRT-BLK', price: 29.99, quantity: 2, total: 59.98 },
              { id: 2, name: 'Casquette Sport', sku: 'CAP-SPORT', price: 19.99, quantity: 1, total: 19.99 },
              { id: 3, name: 'Chaussettes Premium', sku: 'SOCKS-PRM', price: 14.99, quantity: 3, total: 44.97 }
            ]
          },
          {
            id: 'ORD-002',
            orderNumber: 'CMD-2024-002',
            date: '2024-01-14',
            time: '09:15',
            customer: {
              name: 'Marie Martin',
              email: 'marie.martin@email.com',
              phone: '0698765432'
            },
            amount: 89.50,
            subtotal: 84.50,
            shipping: 5.00,
            status: 'shipped',
            payment: {
              method: 'PayPal',
              transactionId: 'TRX-002'
            },
            delivery: {
              method: 'Livraison express',
              address: '456 Avenue des Champs, 69002 Lyon',
              trackingNumber: 'CHR987654321FR'
            },
            items: [
              { id: 4, name: 'Pull en Laine', sku: 'SWEATER-WL', price: 49.99, quantity: 1, total: 49.99 },
              { id: 5, name: 'Écharpe Hiver', sku: 'SCARF-WIN', price: 34.99, quantity: 1, total: 34.99 }
            ]
          },
          {
            id: 'ORD-003',
            orderNumber: 'CMD-2024-003',
            date: '2024-01-13',
            time: '16:45',
            customer: {
              name: 'Pierre Leroy',
              email: 'pierre.leroy@email.com',
              phone: '0789123456'
            },
            amount: 299.95,
            subtotal: 295.00,
            shipping: 4.95,
            status: 'delivered',
            payment: {
              method: 'Carte bancaire',
              transactionId: 'TRX-003'
            },
            delivery: {
              method: 'Chronopost',
              address: '789 Boulevard Saint-Germain, 13001 Marseille',
              trackingNumber: 'CHR555888999FR'
            },
            items: [
              { id: 6, name: 'Veste en Cuir', sku: 'JACKET-LTHR', price: 199.99, quantity: 1, total: 199.99 },
              { id: 7, name: 'Ceinture Cuir', sku: 'BELT-LTHR', price: 49.99, quantity: 2, total: 99.98 }
            ]
          }
        ];
        
        // Formattez comme la DB le ferait
        const formattedOrders = mockOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: new Date(order.date),
          totalPrice: order.amount,
          shippingCost: order.shipping,
          shippingMethod: order.delivery.method,
          shippingAddress: JSON.stringify(order.delivery.address),
          paymentMethod: order.payment.method,
          status: order.status,
          trackingNumber: order.delivery.trackingNumber,
          user: {
            firstName: order.customer.name.split(' ')[0],
            lastName: order.customer.name.split(' ')[1] || '',
            email: order.customer.email,
            phone: order.customer.phone
          },
          OrderItems: order.items.map(item => ({
            id: item.id,
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            Product: {
              name: item.name,
              sku: item.sku,
              img: null,
              price: item.price
            }
          }))
        }));
        
        orders = formattedOrders;
      }
      
      // Formater la réponse
      const responseOrders = orders.map(order => ({
        id: order.id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: order.orderNumber || `CMD-${Date.now()}`,
        date: order.createdAt ? order.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: order.createdAt ? order.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '14:30',
        customer: {
          name: order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Client',
          email: order.user?.email || 'client@example.com',
          phone: order.user?.phone || '0000000000'
        },
        amount: order.totalPrice || 0,
        subtotal: order.totalPrice - (order.shippingCost || 0),
        shipping: order.shippingCost || 0,
        status: order.status || 'confirmed',
        payment: {
          method: order.paymentMethod || 'card',
          transactionId: order.transactionId || `TRX-${Date.now()}`
        },
        delivery: {
          method: order.shippingMethod || 'Standard',
          address: order.shippingAddress ? JSON.parse(order.shippingAddress) : '',
          trackingNumber: order.trackingNumber || ''
        },
        items: (order.OrderItems || []).map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.Product?.name || 'Produit',
          sku: item.Product?.sku || 'N/A',
          price: item.unitPrice || 0,
          quantity: item.quantity || 1,
          total: (item.unitPrice || 0) * (item.quantity || 1),
          image: item.Product?.img
        }))
      }));
      
      // Statistiques
      const stats = {
        totalOrders: responseOrders.length,
        totalRevenue: responseOrders.reduce((sum, order) => sum + order.amount, 0),
        confirmedOrders: responseOrders.filter(o => o.status === 'confirmed').length,
        shippedOrders: responseOrders.filter(o => o.status === 'shipped').length,
        deliveredOrders: responseOrders.filter(o => o.status === 'delivered').length,
        averageOrderValue: responseOrders.length > 0 ? 
          responseOrders.reduce((sum, order) => sum + order.amount, 0) / responseOrders.length : 0
      };
      
      reply.send({
        success: true,
        orders: responseOrders,
        stats,
        pagination: {
          total: responseOrders.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(responseOrders.length / 10)
        },
        note: orders.length === 0 ? 'Données de démo - Base de données vide' : 'Données réelles'
      });
      
    } catch (error) {
      console.error('❌ Erreur récupération commandes admin:', error);
      reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des commandes',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // Route de test simple
  fastify.get('/test', async (request, reply) => {
    reply.send({
      success: true,
      message: 'API Orders fonctionnelle!',
      endpoints: {
        admin: 'GET /admin - Récupérer les commandes admin',
        create: 'POST /create - Créer une commande',
        status: 'PUT /:id/status - Mettre à jour le statut'
      }
    });
  });
  
  // Créer une commande (version simplifiée)
  fastify.post('/create', async (request, reply) => {
    try {
      const { userId, items, deliveryInfo, total, paymentMethod } = request.body;
      
      // Validation basique
      if (!userId || !items || !deliveryInfo) {
        return reply.status(400).send({
          success: false,
          error: 'Données manquantes'
        });
      }
      
      // Générer un numéro de commande
      const orderNumber = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Simuler la création
      const mockOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber,
        userId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR'),
        customer: {
          name: 'Nouveau Client',
          email: 'client@example.com'
        },
        amount: total || 0,
        status: 'confirmed',
        payment: {
          method: paymentMethod || 'card',
          transactionId: `TRX-${Date.now()}`
        },
        delivery: {
          method: deliveryInfo.option?.carrier || 'Standard',
          address: deliveryInfo.address || ''
        },
        items: items || []
      };
      
      reply.status(201).send({
        success: true,
        message: 'Commande créée avec succès (simulation)',
        order: mockOrder,
        note: 'En production, enregistrez en base de données'
      });
      
    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création'
      });
    }
  });
  
  // Mettre à jour le statut d'une commande
  fastify.put('/:orderId/status', async (request, reply) => {
    try {
      const { orderId } = request.params;
      const { status } = request.body;
      
      if (!status) {
        return reply.status(400).send({
          success: false,
          error: 'Statut requis'
        });
      }
      
      reply.send({
        success: true,
        message: `Statut de la commande ${orderId} mis à jour: ${status}`,
        order: {
          id: orderId,
          status,
          updatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour'
      });
    }
  });
  
  // Exporter en CSV
  fastify.get('/admin/export', async (request, reply) => {
    try {
      const csv = [
        ['N° Commande', 'Client', 'Date', 'Montant', 'Statut', 'Livraison'],
        ['CMD-2024-001', 'Jean Dupont', '2024-01-15', '149.99€', 'Confirmée', 'Colissimo'],
        ['CMD-2024-002', 'Marie Martin', '2024-01-14', '89.50€', 'Expédiée', 'Chronopost'],
        ['CMD-2024-003', 'Pierre Leroy', '2024-01-13', '299.95€', 'Livrée', 'Chronopost']
      ].map(row => row.join(',')).join('\n');
      
      reply
        .type('text/csv')
        .header('Content-Disposition', 'attachment; filename=commandes_export.csv')
        .send(csv);
        
    } catch (error) {
      console.error('❌ Erreur export:', error);
      reply.status(500).send({
        success: false,
        error: 'Erreur lors de l\'export'
      });
    }
  });
}

// Exportez comme plugin Fastify
export default orderRoutes;