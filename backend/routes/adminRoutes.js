import {authenticate} from '../security/jwt.js';
import {getAdmin,getAdminStat,getAllOrderAdmin,DeleteOrderAdmin,PaidOrderAdmin} from '../controllers/adminController.js';

export default async function adminRoutes(fastify, opts) {
  fastify.get('/', { preHandler: [authenticate] }, getAdmin);
  fastify.get('/stats', { preHandler: [authenticate] }, getAdminStat);
  fastify.get('/getOrder', { preHandler: [authenticate] }, getAllOrderAdmin);
  fastify.delete("/deleteOrder", DeleteOrderAdmin);
  fastify.post('/paidOrder', { preHandler: [authenticate] }, PaidOrderAdmin);

}