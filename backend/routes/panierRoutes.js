// routes/panierRoutes.js
import { authenticate } from '../security/jwt.js';
import {
  createOrder,
  confirmCartOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getOrderStats,
  trackOrder,
  getOrderItems,
  // Fonctions admin (optionnel)
  getAllOrder,
  deleteOrder,
  updateOrder,
} from '../controllers/panierController.js'; // Modifier l'import

export default async function orderRoutes(fastify, options) {
  
  console.log('📝 Enregistrement des routes commandes');

  // POST /api/orders/create - Créer une commande
  fastify.post('/create', {
    preHandler: [authenticate]
  }, createOrder);

  // GET /api/orders/user - Commandes de l'utilisateur
  fastify.get('/user', {
    preHandler: [authenticate]
  }, getUserOrders);
 // POST /api/orders/confirm - Confirmer le panier (NOUVELLE ROUTE)
  fastify.post('/confirm', {
    preHandler: [authenticate]
  }, confirmCartOrder)

  // GET /api/orders/stats - Statistiques
  fastify.get('/stats', {
    preHandler: [authenticate]
  }, getOrderStats);

  // GET /api/orders/:orderId - Détails d'une commande
  fastify.get('/:orderId', {
    preHandler: [authenticate]
  }, getOrderById);

  // GET /api/orders/:orderId/items - Items d'une commande
  fastify.get('/:orderId/items', {
    preHandler: [authenticate]
  }, getOrderItems);

  // PUT /api/orders/:orderId/cancel - Annuler
  fastify.put('/:orderId/cancel', {
    preHandler: [authenticate]
  }, cancelOrder);

  // GET /api/orders/tracking/:orderNumber - Suivi
  fastify.get('/tracking/:orderNumber', {
    preHandler: [authenticate]
  }, trackOrder);

  // ============ ROUTES ADMIN (optionnel) ============
  
  // GET /api/orders/admin/all - Toutes les commandes (admin)
  fastify.get('/admin/all', {
    preHandler: [authenticate] // Ajoutez aussi un middleware admin
  }, getAllOrder);

  // DELETE /api/orders/admin/:orderId - Supprimer une commande (admin)
  fastify.delete('/admin/:orderId', {
    preHandler: [authenticate] // Ajoutez aussi un middleware admin
  }, deleteOrder);

  // PUT /api/orders/admin/:orderId - Mettre à jour une commande (admin)
  fastify.put('/admin/:orderId', {
    preHandler: [authenticate] // Ajoutez aussi un middleware admin
  }, updateOrder);

  

  console.log('✅ Routes commandes enregistrées');
}