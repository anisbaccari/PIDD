
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
  getOrderDetails
} from '../controllers/adminOrderController.js';

export default async function adminOrderRoutes(fastify, options) {
  
  console.log('📝 Enregistrement des routes admin orders');

  // GET /api/orders/admin - Liste des commandes (avec filtres)
  fastify.get('/admin', {
    preHandler: [authenticate]
  }, getAllOrders);

  // GET /api/orders/admin/export - Export CSV
  fastify.get('/admin/export', {
    preHandler: [authenticate]
  }, exportOrders);

  // GET /api/orders/:orderId - Détails d'une commande
  fastify.get('/:orderId', {
    preHandler: [authenticate]
  }, getOrderDetails);

  // PUT /api/orders/:orderId/status - Mettre à jour le statut
  fastify.put('/:orderId/status', {
    preHandler: [authenticate]
  }, updateOrderStatus);

  // PUT /api/orders/bulk/status - Mise à jour en masse
  fastify.put('/bulk/status', {
    preHandler: [authenticate]
  }, updateBulkOrderStatus);

  // DELETE /api/orders/:orderId - Supprimer une commande
  fastify.delete('/:orderId', {
    preHandler: [authenticate]
  }, deleteOrder);

  console.log('✅ Routes admin orders enregistrées');
   }