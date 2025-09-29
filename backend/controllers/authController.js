// controllers/authController.js
import { generateToken } from '../middleware/authMiddleware.js';

export const login = async (request, reply) => {
  const { username, password } = request.body;

  // ⚡ TODO: replace with DB check
  if (username !== 'test' || password !== '1234') {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: 1, username });

  reply.send({ message: 'Login successful', token });
};

export const register = async (request, reply) => {
  const { username, password } = request.body;

  // ⚡ TODO: save user in DB
  reply.send({ message: 'User registered', user: { username } });
};
