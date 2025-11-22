import {authenticate} from '../security/jwt.js';
import {getAdmin} from '../controllers/adminController.js';

export default async function adminRoutes(fastify, opts) {
  fastify.get('/', { preHandler: [authenticate] }, getAdmin);
}