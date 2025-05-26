import { findUserByEmail, createResetToken } from '../../lib/data.js';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const user = findUserByEmail(email);
  // Always respond success to avoid user enumeration
  const token = crypto.randomBytes(16).toString('hex');
  if (user) {
    createResetToken(email, token);
    console.log(`Password reset token for ${email}: ${token}`);
  }

  res.status(200).json({ success: true, token });
}
