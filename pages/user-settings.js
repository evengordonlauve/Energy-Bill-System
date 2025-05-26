import { useState } from 'react';
import { parse } from 'cookie';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (!cookies.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const user = JSON.parse(Buffer.from(cookies.user, 'base64').toString('utf8'));
  return { props: { user } };
}

export default function UserSettings({ user }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Passord oppdatert (simulert).');
    setPassword('');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Brukerinnstillinger for {user.username}</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '300px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Nytt passord</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2" />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', background:'#333', color:'#fff' }}>Lagre</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
