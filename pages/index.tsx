import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h1>Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h3>Cost Calculations</h3>
          <p>Create and manage cost distributions.</p>
          <Link href="/calculations/cost">Open</Link>
        </div>
        <div className="card">
          <h3>Price Lists</h3>
          <p>Generate price quotes for customers.</p>
          <Link href="/calculations/price">Open</Link>
        </div>
        <div className="card">
          <h3>Customers</h3>
          <p>View registered customers and assets.</p>
          <Link href="/customers">Open</Link>
        </div>
        <div className="card">
          <h3>Checklists</h3>
          <p>Keep track of building checklists.</p>
          <Link href="/checklists">Open</Link>
        </div>
        <div className="card">
          <h3>Administration</h3>
          <p>User management and system settings.</p>
          <Link href="/admin">Open</Link>
        </div>
      </div>
    </Layout>
  );
}
