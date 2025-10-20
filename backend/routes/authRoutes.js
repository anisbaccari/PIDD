import {login, register} from '../controllers/authController.js'
export default async function authRoutes(fastify, opts) {


  // --- Register route ---
  fastify.post('/register', register);

  // --- Login route ---
  fastify.post('/login',login);
}
