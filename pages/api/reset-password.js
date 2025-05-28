import {
  getEmailByResetToken,
  deleteResetToken,
  updateUserPassword,
  hashPassword,
} from '../../lib/auth.js';

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

  const passwordHash = await hashPassword(password);
  await updateUserPassword(email, passwordHash);
  await deleteResetToken(token);
  res.status(200).json({ success: true });
}
