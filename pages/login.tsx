import { FormEvent, ChangeEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }
    const success = await login(email, password);
    if (success) {
      setError('');
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Acron Energy Tools</h1>
        <h2>Welcome Back</h2>
        <p className="description">Sign in to your account to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">Sign In</button>
        </form>
        <p className="footer">Demo credentials: admin@example.com / admin123</p>
      </div>
    </div>
  );
}
