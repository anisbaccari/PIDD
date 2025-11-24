import {authenticate} from '../security/jwt.js';
import {getPanier} from '../controllers/panierController.js';

export default async function panierRoutes(fastify, opts) {
  fastify.get('/', { preHandler: [authenticate] }, getPanier);
}