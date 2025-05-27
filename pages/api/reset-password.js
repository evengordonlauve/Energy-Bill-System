import {
  getEmailByResetToken,
  deleteResetToken,
  updateUserPassword,
} from '../../lib/auth.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const email = await getEmailByResetToken(token);
  if (!email) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  await updateUserPassword(email, passwordHash);
  await deleteResetToken(token);
  res.status(200).json({ success: true });
}
