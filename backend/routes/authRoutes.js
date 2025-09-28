import { hash, compare } from 'bcrypt';
import pool from '../database/mysql.js';
import { generateToken } from '../security/jwt.js';

export default async function authRoutes(fastify, opts) {

  // --- Register route ---
  fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body;
    console.log('Request body:', request.body); // <-- log it
    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return reply.status(400).send({ error: 'User already exists' });
      }

      const hashed = await hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashed]
      );

      reply.send({ success: true, userId: result.insertId });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  });

  // --- Login route ---
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

      if (rows.length === 0) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const user = rows[0];
      const match = await compare(password, user.password);

      if (!match) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = generateToken({ id: user.id, username: user.username });

      reply.send({ success: true, token });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  });
}
