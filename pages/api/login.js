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
}
