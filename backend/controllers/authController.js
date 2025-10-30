// controllers/authController.js
import { compare, hash } from 'bcrypt';
import { sequelize } from '../database/mysql.js';
import { generateToken } from '../security/jwt.js';

export  async function login (request, reply) {
    const { username, password } = request.body;

      console.log('================================================');
      console.log('[PROFIL] receive request : ', request.body);
      console.log('================================================');


    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    try {
    const rows = await sequelize.query(
          'SELECT * FROM users WHERE username = :username',
          {
            replacements: { username },
            type: sequelize.QueryTypes.SELECT,
          }
        );

      if (rows.length === 0) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const user = rows[0];
      const match = await compare(password, user.passwordHash);

      if (!match) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = generateToken({ id: user.id, username: user.username });
      
      // log the generated token
      console.log('Generated JWT:', token);
      reply.send({ success: true, token,user });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  };


export async function register(request, reply) {
  const { nom, prenom, username, password } = request.body;

  if (!username || !password) {
    return reply.status(400).send({ error: 'Username and password required' });
  }

  try {
    const existing = await sequelize.query(
      'SELECT * FROM users WHERE username = :username',
      { replacements: { username }, type: sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const hashed = await hash(password, 10);
    const result = await sequelize.query(
      `INSERT INTO users (nom, prenom, username, passwordHash) 
       VALUES (:nom, :prenom, :username, :hashed)`,
      {
        replacements: { nom, prenom, username, hashed },
        type: sequelize.QueryTypes.INSERT
      }
    );

    // ✅ Réponse plus complète
    reply.send({
      success: true,
      message: 'User created successfully',
      user: { nom, prenom, username },
      userId: result[0]
    });
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    reply.status(500).send({ error: err.message });
  }
}
