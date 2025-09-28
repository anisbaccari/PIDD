import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET || 'defaultsecret';

export function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
