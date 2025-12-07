// controllers/authController.js
import { compare, hash } from 'bcrypt';
import { sequelize } from '../database/mysql.js';
import { generateToken } from '../security/jwt.js';

export async function login(request, reply) {
  try {
    const { username, password } = request.body;

    console.log('================================================');
    console.log('[LOGIN] receive request : ', request.body);
    console.log('================================================');

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    console.log('\x1b[32m%s\x1b[0m','[LOGIN] user ', username);

    const rows = await sequelize.query(
      'SELECT * FROM users WHERE username = :username',
      {
        replacements: { username },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log('\x1b[32m%s\x1b[0m','[LOGIN] ROW ', rows);

    if (rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    console.log('\x1b[32m%s\x1b[0m','[LOGIN] USER FOUND');

    const user = rows[0];
    const match = await compare(password, user.passwordHash);

    if (!match) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    console.log('\x1b[32m%s\x1b[0m','[LOGIN] login succeeded');

    // Generate JWT
    const token = generateToken({ id: user.id, username: user.username });
    
    console.log('Generated JWT:', token);

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    };

    reply.send({ success: true, token, user: userResponse });

  } catch (err) {
    console.log('[LOGIN] err', err);
    reply.status(500).send({ error: err.message });
  }
}

export async function register(request, reply) {
  try {
    // Log de débogage pour voir ce qui est reçu
    console.log('================================================');
    console.log('[REGISTER] Données reçues :', request.body);
    console.log('================================================');

    const { name, lastName, username, password, email } = request.body;

    // Validation initiale avec messages détaillés
    if (!name || name.trim() === '') {
      return reply.status(400).send({ error: 'Le nom est requis' });
    }
    if (!lastName || lastName.trim() === '') {
      return reply.status(400).send({ error: 'Le prénom est requis' });
    }
    if (!email || email.trim() === '') {
      return reply.status(400).send({ error: 'L\'email est requis' });
    }
    if (!username || username.trim() === '') {
      return reply.status(400).send({ error: 'Le nom d\'utilisateur est requis' });
    }
    if (!password || password.trim() === '') {
      return reply.status(400).send({ error: 'Le mot de passe est requis' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({ error: 'Format d\'email invalide' });
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return reply.status(400).send({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    console.log('[REGISTER] Vérification de l\'existence de l\'utilisateur...');

    // Vérification de l'utilisateur existant
    const existing = await sequelize.query(
      'SELECT username, email FROM users WHERE username = :username OR email = :email',
      { 
        replacements: { username: username.trim(), email: email.trim() }, 
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (existing.length > 0) {
      const existsUsername = existing.some(u => u.username === username.trim());
      const existsEmail = existing.some(u => u.email === email.trim());
      
      if (existsUsername) {
        return reply.status(400).send({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
      if (existsEmail) {
        return reply.status(400).send({ error: 'Cet email est déjà utilisé' });
      }
    }

    console.log('[REGISTER] Hashage du mot de passe...');
    
    // Hashage du mot de passe
    const hashed = await hash(password, 10);

    console.log('[REGISTER] Insertion dans la base de données...');

    // Insertion dans la base de données
    const result = await sequelize.query(
      `INSERT INTO users (name, lastName, username, email, passwordHash, is_admin) 
       VALUES (:name, :lastName, :username, :email, :hashed, :is_admin)`,
      {
        replacements: { 
          name: name.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
          hashed: hashed,
          is_admin: false
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('[REGISTER] Résultat de l\'insertion :', result);

    // Récupération de l'ID du nouvel utilisateur
    const newUserId = result[0];

    console.log('[REGISTER] Nouvel ID utilisateur :', newUserId);

    // Génération du token
    const token = generateToken({ id: newUserId, username: username.trim() });

    // Préparation de la réponse utilisateur
    const userPayload = { 
      id: newUserId,
      name: name.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      is_admin: false
    };

    console.log('[REGISTER] Inscription réussie pour :', username);

    reply.send({
      success: true,
      message: 'Compte créé avec succès',
      user: userPayload,
      userId: newUserId,
      token
    });

  } catch (err) {
    console.error('[REGISTER] Erreur lors de l\'inscription :', err);
    reply.status(500).send({ 
      error: 'Une erreur est survenue lors de l\'inscription',
      details: err.message 
    });
  }
}