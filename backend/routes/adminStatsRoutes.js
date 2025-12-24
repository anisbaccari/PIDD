// ============================================
// routes/adminStatsRoutes.js
// ============================================
import { authenticate } from '../security/jwt.js';
import {
  getGeneralStats,
  getRevenueEvolution,
  getTopProducts,
  getSalesByCategory,
  getCustomerStats,
  getProductStats,
  getDashboardStats
} from '../controllers/adminStatsController.js';

export default async function adminStatsRoutes(fastify, options) {
  
  console.log('📊 Enregistrement des routes admin stats');

  // GET /admin/stats - Dashboard complet
  fastify.get('/', {
    preHandler: [authenticate]
  }, getDashboardStats);

  // GET /admin/stats/general - Statistiques générales
  fastify.get('/general', {
    preHandler: [authenticate]
  }, getGeneralStats);

  // GET /admin/stats/revenue-evolution - Évolution du chiffre d'affaires
  fastify.get('/revenue-evolution', {
    preHandler: [authenticate]
  }, getRevenueEvolution);

  // GET /admin/stats/top-products - Top produits
  fastify.get('/top-products', {
    preHandler: [authenticate]
  }, getTopProducts);

  // GET /admin/stats/sales-by-category - Ventes par catégorie
  fastify.get('/sales-by-category', {
    preHandler: [authenticate]
  }, getSalesByCategory);

  // GET /admin/stats/customer-stats - Statistiques clients
  fastify.get('/customer-stats', {
    preHandler: [authenticate]
  }, getCustomerStats);

  // GET /admin/stats/product-stats - Statistiques produits détaillées
  fastify.get('/product-stats', {
    preHandler: [authenticate]
  }, getProductStats);

  console.log('✅ Routes admin stats enregistrées');
  console.log('   - GET /admin/stats');
  console.log('   - GET /admin/stats/general');
  console.log('   - GET /admin/stats/revenue-evolution');
  console.log('   - GET /admin/stats/top-products');
  console.log('   - GET /admin/stats/sales-by-category');
  console.log('   - GET /admin/stats/customer-stats');
  console.log('   - GET /admin/stats/product-stats');
}