// routes/adminStatsRoutes.js
import { 
  getGeneralStats, 
  getRevenueEvolution, 
  getTopProducts, 
  getSalesByCategory,
  getCustomerStats,
  getProductStats,
  getDashboardStats,
  testStats,
  exportStats,
  getRealtimeStats
} from '../controllers/adminStatsController.js';

export default async function adminStatsRoutes(fastify, options) {
  // Test endpoint
  fastify.get('/test', testStats);
  
  // Statistiques générales
  fastify.get('/general', getGeneralStats);
  
  // Évolution du chiffre d'affaires
  fastify.get('/revenue-evolution', getRevenueEvolution);
  
  // Top produits
  fastify.get('/top-products', getTopProducts);
  
  // Ventes par catégorie
  fastify.get('/categories', getSalesByCategory);
  
  // Statistiques clients
  fastify.get('/customers', getCustomerStats);
  
  // Statistiques produits
  fastify.get('/products', getProductStats);
  
  // Dashboard complet
  fastify.get('/dashboard', getDashboardStats);
  
  // Stats temps réel
  fastify.get('/realtime', getRealtimeStats);
  
  // Export
  fastify.get('/export', exportStats);
}