// routes/userRoutes.js
import { getAllUsers, getUserById } from '../controllers/userController.js';
import { authenticate } from '../security/jwt.js';

export default async function userRoutes(fastify, opts) {
  // Route pour récupérer tous les utilisateurs (protégée)
  fastify.get('/users', { preHandler: authenticate }, getAllUsers);
  
  // Route pour récupérer un utilisateur spécifique
  fastify.get('/users/:id', { preHandler: authenticate }, getUserById);
}