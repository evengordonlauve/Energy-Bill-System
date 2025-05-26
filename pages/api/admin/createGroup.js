import { addGroup, getSession, getUsers } from '../../../lib/data.js';
import { parse } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies.session;
  const sessionUserId = getSession(token);
  const currentUser = getUsers().find(u => u.id === sessionUserId);
  if (!currentUser || !currentUser.groups.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  addGroup(name);
  res.status(200).json({ success: true });
}
