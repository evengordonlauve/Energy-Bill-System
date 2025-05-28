import { createUser, findUserByEmail, hashPassword } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (await findUserByEmail(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = await hashPassword(password);
  await createUser(email, passwordHash, []);

  res.status(200).json({ success: true });
}
