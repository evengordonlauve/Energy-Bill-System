import { parse } from 'cookie';
import { getSession, getUsers } from '../lib/auth.js';
import Link from 'next/link';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  const userId = await getSession(token);
  const users = await getUsers();
  const user = users.find(u => u.id === userId) || null;
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
  );
}
