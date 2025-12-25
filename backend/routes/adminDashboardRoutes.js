// routes/adminDashboardRoutes.js
import {
  getDashboardStats,
  getRealtimeDashboardData,
  testDashboardConnection
} from '../controllers/adminDashboardController.js'

// (optionnel) si tu as déjà un middleware admin
// import { verifyAdmin } from '../middlewares/adminMiddleware.js'

export default async function adminDashboardRoutes(fastify, options) {

  console.log('🚀 Admin Dashboard Routes chargées')

  // Tu peux protéger TOUTES les routes ici :
  // fastify.addHook('preHandler', verifyAdmin)

  fastify.get('/admin/dashboard/stats', async (request, reply) => {
    return getDashboardStats(request, reply)
  })

  fastify.get('/admin/dashboard/realtime', async (request, reply) => {
    return getRealtimeDashboardData(request, reply)
  })

  fastify.get('/admin/dashboard/test', async (request, reply) => {
    return testDashboardConnection(request, reply)
  })
}
