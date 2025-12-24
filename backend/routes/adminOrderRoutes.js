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

  // GET /admin/orders - Liste des commandes (avec filtres)
  fastify.get('/', {
    preHandler: [authenticate]
  }, getAllOrders);

  // GET /admin/orders/export - Export CSV
  fastify.get('/export', {
    preHandler: [authenticate]
  }, exportOrders);

  // GET /admin/orders/:orderId - Détails d'une commande
  fastify.get('/:orderId', {
    preHandler: [authenticate]
  }, getOrderDetails);

  // PUT /admin/orders/:orderId/status - Mettre à jour le statut
  fastify.put('/:orderId/status', {
    preHandler: [authenticate]
  }, updateOrderStatus);

  // PUT /admin/orders/bulk/status - Mise à jour en masse
  fastify.put('/bulk/status', {
    preHandler: [authenticate]
  }, updateBulkOrderStatus);

  // DELETE /admin/orders/:orderId - Supprimer une commande
  fastify.delete('/:orderId', {
    preHandler: [authenticate]
  }, deleteOrder);

  console.log('✅ Routes admin orders enregistrées');
  console.log('   - GET    /admin/orders');
  console.log('   - GET    /admin/orders/export');
  console.log('   - GET    /admin/orders/:orderId');
  console.log('   - PUT    /admin/orders/:orderId/status');
  console.log('   - PUT    /admin/orders/bulk/status');
  console.log('   - DELETE /admin/orders/:orderId');
}