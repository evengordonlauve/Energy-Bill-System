import { deleteSession } from '../../lib/data.js';
import { parse } from 'cookie';

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.session;
  if (token) {
    deleteSession(token);
    res.setHeader('Set-Cookie', 'session=; Path=/; Max-Age=0');
  }
  res.status(200).json({ success: true });
}
