 codex/design-login-page-with-background-and-menu
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [group, setGroup] = useState('user');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, group, password })
    });
    router.push('/home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1650&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#fff'
    }}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>Acron Energy System</h1>
      <h2 style={{marginBottom: '1rem'}}>TOOLS</h2>
      <form onSubmit={handleSubmit} style={{background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '8px'}}>
        <div style={{marginBottom: '0.5rem'}}>
          <label className="block text-white">Brukernavn</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2"/>
        </div>
        <div style={{marginBottom: '0.5rem'}}>
          <label className="block text-white">Gruppe</label>
          <select value={group} onChange={e=>setGroup(e.target.value)} className="w-full p-2">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{marginBottom: '0.5rem'}}>
          <label className="block text-white">Passord</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2" />
        </div>
        <button type="submit" style={{background: '#4CAF50', padding: '0.5rem 1rem', color: 'white', borderRadius: '4px'}}>Logg inn</button>
      </form>
    </div>
=======
import { parse } from 'cookie';
import { getSession } from '../lib/data.js';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  const userId = getSession(token);
  if (userId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default function Login() {
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      location.href = '/';
    } else {
      alert('Login failed');
    }
  }
  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="email" type="email" placeholder="Email" className="border p-2" required />
        <input name="password" type="password" placeholder="Password" className="border p-2" required />
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </main>
 main
  );
}
