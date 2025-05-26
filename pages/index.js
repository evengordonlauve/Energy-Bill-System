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
  );
}
