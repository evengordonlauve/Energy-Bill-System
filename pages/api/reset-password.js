import {
  getEmailByResetToken,
  deleteResetToken,
  updateUserPassword,
} from '../../lib/data.js';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const email = getEmailByResetToken(token);
  if (!email) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  updateUserPassword(email, passwordHash);
  deleteResetToken(token);
  res.status(200).json({ success: true });
}
