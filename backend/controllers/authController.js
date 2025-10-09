// controllers/authController.js
import { hash, compare } from 'bcrypt';
import { User } from '../models/User.js';
import { generateToken } from '../security/jwt.js';

export async function login(request, reply) {
  const { username, password } = request.body;

  if (!username || !password) {
    return reply.status(400).send({ error: 'Username and password required' });
  }

  try {
    console.log('--------------------------------Request body:', request.body);

    // use the Sequelize model to find the user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const match = await compare(password, user.password);
    if (!match) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, username: user.username });
    console.log('Generated JWT:', token);

    // don't send the password back to client
    const safeUser = { id: user.id, username: user.username, email: user.email };

    reply.send({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    reply.status(500).send({ error: err.message });
  }
}

export async function register(request, reply) {
  const { username, password, email } = request.body;
  console.log('Request body:', request.body);

  if (!username || !password) {
    return reply.status(400).send({ error: 'Username and password required' });
  }

  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const hashed = await hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashed,
      email: email || null
    });

    reply.send({ success: true, userId: newUser.id });
  } catch (err) {
    console.error('Register error:', err);
    reply.status(500).send({ error: err.message });
  }
}
