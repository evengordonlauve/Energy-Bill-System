import { parse } from 'cookie';
import { getSession } from '../lib/data.js';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  const userId = await getSession(token);
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
  );
}
