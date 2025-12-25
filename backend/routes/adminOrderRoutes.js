// ============================================
// routes/adminOrderRoutes.js
// ============================================
import { authenticate } from '../security/jwt.js';
import {
  getAllOrders,
  exportOrders,
  updateOrderStatus,
  updateBulkOrderStatus,
  deleteOrder,
  getOrderDetails,
  getOrdersStats  // Nouvelle fonction ajoutée
} from '../controllers/adminOrderController.js';

export default async function adminOrderRoutes(fastify, options) {
  
  console.log('📝 Enregistrement des routes admin orders');

  // 🔥 CORRECTION : Route principale pour les commandes admin
  // GET /api/admin/orders - Liste des commandes (avec filtres)
  fastify.get('/', {
    preHandler: [authenticate]
  }, getAllOrders);

  // GET /api/admin/orders/stats - Statistiques des commandes
  fastify.get('/stats', {
    preHandler: [authenticate]
  }, getOrdersStats);

  // GET /api/admin/orders/export - Export CSV
  fastify.get('/export', {
    preHandler: [authenticate]
  }, exportOrders);

  // GET /api/admin/orders/:orderId - Détails d'une commande
  fastify.get('/:orderId', {
    preHandler: [authenticate]
  }, getOrderDetails);

  // PUT /api/admin/orders/:orderId/status - Mettre à jour le statut
  fastify.put('/:orderId/status', {
    preHandler: [authenticate]
  }, updateOrderStatus);

  // PUT /api/admin/orders/bulk/status - Mise à jour en masse
  fastify.put('/bulk/status', {
    preHandler: [authenticate]
  }, updateBulkOrderStatus);

  // DELETE /api/admin/orders/:orderId - Supprimer une commande
  fastify.delete('/:orderId', {
    preHandler: [authenticate]
  }, deleteOrder);

  console.log('✅ Routes admin orders enregistrées');
}