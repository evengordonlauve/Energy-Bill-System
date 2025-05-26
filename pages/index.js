 codex/lag-next.js-side-med-firebase-auth
import { useState } from 'react';
import Link from 'next/link';
import { initFirebase, auth } from '@/firebase/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';

initFirebase();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth(), email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl mb-4 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mb-2">
          Login
        </button>
        <div className="flex justify-between text-sm">
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
=======
import { parse } from 'cookie';
 codex/design-login-page-with-background-and-menu

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const destination = cookies.user ? '/home' : '/login';
  return { redirect: { destination, permanent: false } };
=======
import { getSession, getUsers } from '../lib/data.js';
import Link from 'next/link';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  const userId = getSession(token);
  const user = getUsers().find(u => u.id === userId) || null;
  return { props: { user } };
}

export default function Home({ user }) {
  async function handleLogout() {
    await fetch('/api/logout');
    location.reload();
  }
  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">Home Page</h1>
      {!user && <Link href="/login" className="text-blue-600 underline">Login</Link>}
      {user && (
        <div className="flex flex-col gap-2">
          <p>Logged in as {user.email}</p>
          <button onClick={handleLogout} className="bg-gray-500 text-white p-2 w-24">Logout</button>
          {user.groups.includes('admin') && (
            <Link href="/AdminPanel" className="text-blue-600 underline">Admin Panel</Link>
          )}
        </div>
      )}
    </main>
 main
  );
 main
}

export default function Index() { return null; }
