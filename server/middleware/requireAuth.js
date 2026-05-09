import { verifyToken } from '../lib/jwt.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'unauthorized' });

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select('_id username handle email location xp streak maxStreak solved createdAt');
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}
