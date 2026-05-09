import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('Missing JWT_SECRET in environment.');
    err.code = 'MISSING_JWT_SECRET';
    throw err;
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
