import { addUser, findUserByEmail } from '../../lib/data.js';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (findUserByEmail(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  addUser(email, passwordHash, []);

  res.status(200).json({ success: true });
}
