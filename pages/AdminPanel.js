import { parse } from 'cookie';
import { getSession, getUsers, getGroups } from '../lib/data.js';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  const userId = await getSession(token);
  const users = await getUsers();
  const user = users.find(u => u.id === userId);

  if (!user || !user.groups.includes('admin')) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const groups = await getGroups();
  return { props: { groups } };
}

export default function AdminPanel({ groups }) {
  async function handleCreateUser(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const groups = form.groups.value.split(',').map(s => s.trim()).filter(Boolean);
    await fetch('/api/admin/createUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, groups }),
    });
    form.reset();
    alert('User created');
  }

  async function handleCreateGroup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value;
    await fetch('/api/admin/createGroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    form.reset();
    alert('Group created');
  }

  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">Admin Panel</h1>

      <section className="mb-8">
        <h2 className="font-semibold">Create User</h2>
        <form onSubmit={handleCreateUser} className="flex flex-col gap-2 mt-2">
          <input name="email" type="email" placeholder="Email" className="border p-2" required />
          <input name="password" type="password" placeholder="Password" className="border p-2" required />
          <input name="groups" placeholder="Groups (comma separated)" className="border p-2" />
          <button type="submit" className="bg-blue-500 text-white p-2">Create</button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold">Create Group</h2>
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-2 mt-2">
          <input name="name" placeholder="Group name" className="border p-2" required />
          <button type="submit" className="bg-blue-500 text-white p-2">Create</button>
        </form>
        <p className="mt-2">Existing groups: {groups.join(', ')}</p>
      </section>
    </main>
  );
}
