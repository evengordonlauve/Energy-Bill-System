import Link from 'next/link';
import Layout from '../../components/Layout';

export default function AdminHome() {
  return (
    <Layout>
      <h1>Administration</h1>
      <div className="card-grid">
        <div className="card">
          <h3>User Management</h3>
          <p>Create and edit users.</p>
          <Link href="/admin/users">Open</Link>
        </div>
        <div className="card">
          <h3>Settings</h3>
          <p>System configuration.</p>
          <Link href="/admin/settings">Open</Link>
        </div>
      </div>
    </Layout>
  );
}
