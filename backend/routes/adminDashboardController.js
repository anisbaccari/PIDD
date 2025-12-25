import {
  getSimpleDashboardStats,
  getAdminOrders,
  getTopProducts
} from '../controllers/adminDashboardController.js'

fastify.get('/admin/dashboard/stats', getSimpleDashboardStats)
fastify.get('/admin/orders', getAdminOrders)
fastify.get('/admin/products/top', getTopProducts)
