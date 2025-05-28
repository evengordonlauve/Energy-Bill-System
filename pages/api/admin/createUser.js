import {
  createUser,
  getSession,
  getUsers,
  hashPassword,
} from '../../../lib/auth.js';
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies.session;
  const sessionUserId = await getSession(token);
  const users = await getUsers();
  const currentUser = users.find(u => u.id === sessionUserId);
  if (!currentUser || !currentUser.groups.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email, password, groups } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const passwordHash = await hashPassword(password);
  await createUser(email, passwordHash, Array.isArray(groups) ? groups : []);
  res.status(200).json({ success: true });
}
