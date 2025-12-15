// controllers/authController.js
import { compare, hash } from 'bcrypt';
import { sequelize } from '../database/mysql.js';
import { generateToken } from '../security/jwt.js';

export  async function login (request, reply) {
  try {
      const { email, password } = request.body;

      console.log('================================================');
      console.log('[PROFIL] receive request : ', request.body);
      console.log('================================================');


      if (!email || !password) {
        return reply.status(400).send({ error: 'email and password required' });
      }
      console.log('\x1b[32m%s\x1b[0m','[PROFIL]user ',email,password);

      const rows = await sequelize.query(
          'SELECT * FROM users WHERE email = :email',
          {
            replacements: { email },
            type: sequelize.QueryTypes.SELECT,
          }
        );
      console.log('\x1b[32m%s\x1b[0m','[PROFIL]ROW ',rows);

      if (rows.length === 0) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      console.log('\x1b[32m%s\x1b[0m','[PROFIL] USER FOUND ');

      const user = rows[0];
      const match = await compare(password, user.passwordHash);

      if (!match) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      console.log('\x1b[32m%s\x1b[0m','[PROFIL] profils succed ');

      // Generate JWT
      const token = generateToken({ id: user.id, username: user.username });
      
      // log the generated token
      console.log('Generated JWT:', token);
      reply.send({ success: true, token,user });
    } catch (err) {
      console.log(' [PROFIL] err', err);

      reply.status(500).send({ error: err.message });
    }
  };


export async function register(request, reply) {
  const { name, lastName,email, username, password,address } = request.body;

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

      console.log("[register] :address ",address);

    const hashed = await hash(password, 10);
    const result = await sequelize.query(
      `INSERT INTO users (name, lastName,email,  username,address, passwordHash) 
       VALUES (:name, :lastName, :email,  :username, :address, :hashed)`,
      {
        replacements: { name, lastName,email, username, address, hashed },
        type: sequelize.QueryTypes.INSERT
      }
    );

    // ✅ Réponse plus complète
    reply.send({
      success: true,
      message: 'User created successfully',
      user: { name, lastName, username },
      userId: result[0]
    });
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    reply.status(500).send({ error: err.message });
  }
}
