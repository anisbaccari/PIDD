import {authenticate} from '../security/jwt.js';
import {getAdmin,getAllOrderAdmin,DeleteOrderAdmin,PaidOrderAdmin} from '../controllers/adminController.js';

export default async function adminRoutes(fastify, opts) {
  fastify.get('/', { preHandler: [authenticate] }, getAdmin);
  fastify.get('/getOrder', { preHandler: [authenticate] }, getAllOrderAdmin);
  fastify.delete("/deleteOrder", DeleteOrderAdmin);
  fastify.post('/paidOrder', { preHandler: [authenticate] }, PaidOrderAdmin);

}