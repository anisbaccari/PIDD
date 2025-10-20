import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // fallback if not in .env

// 🔹 Generate a JWT token for a user
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username }, // payload
    JWT_SECRET,
    { expiresIn: '1h' } // token validity
  );
}

// 🔹 Verify a JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // invalid or expired token
  }
}

// 🔹 Middleware for protected routes

export async function authenticate(request, reply) {
  try {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return reply.code(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return reply.code(401).send({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔹 attach user to request for later use
    request.user = { id: decoded.id, username: decoded.username };

    console.log('Authenticated user:', decoded);
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized: ' + err.message });
  }
}
