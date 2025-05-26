import { useState } from 'react';
import Link from 'next/link';
import { initFirebase, auth } from '@/firebase/firebaseClient';
import { sendPasswordResetEmail } from 'firebase/auth';

initFirebase();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth(), email);
      setMessage('Password reset email sent');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleReset} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl mb-4 text-center">Forgot Password</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mb-2">
          Send reset email
        </button>
        <Link href="/" className="text-sm text-blue-500 hover:underline">
          Back to login
        </Link>
      </form>
    </div>
  );
}
