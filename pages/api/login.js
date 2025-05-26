 codex/design-login-page-with-background-and-menu
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { username = '', group = 'user' } = req.body || {};
  const role = group === 'admin' ? 'admin' : 'user';
  const cookieValue = Buffer.from(JSON.stringify({ username, group, role })).toString('base64');
  res.setHeader('Set-Cookie', `user=${cookieValue}; Path=/; HttpOnly=false`);
  res.status(200).json({ ok: true });
=======
import { findUserByEmail, createSession } from '../../lib/data.js';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = crypto.randomBytes(16).toString('hex');
  createSession(user.id, token);
  res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly`);
  res.status(200).json({ success: true });
 main
}
