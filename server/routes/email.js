import { Router } from 'express';
import { validateEmailDomain } from '../lib/validateEmailDomain.js';

const router = Router();

router.get('/validate', async (req, res) => {
  const email = String(req.query.email || '');
  if (!email) return res.status(400).json({ ok: false, reason: 'missing_email' });
  const result = await validateEmailDomain(email);
  return res.json(result);
});

export default router;

