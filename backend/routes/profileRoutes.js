                                                                                                    import {authenticate} from '../security/jwt.js';
import {getProfile, updateProfile} from '../controllers/profileController.js';

export default async function profileRoutes(fastify, opts) {
  fastify.get('/', { preHandler: [authenticate] }, getProfile);
  fastify.put('/', { preHandler: [authenticate] }, updateProfile);
}