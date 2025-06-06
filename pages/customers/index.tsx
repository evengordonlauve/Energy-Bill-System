import { useState } from 'react';
import Layout from '../../components/Layout';

const sampleCustomers = [
  {
    id: 1,
    name: 'Acme Corp',
    org: '123456789',
    contact: { name: 'John Doe', email: 'john@example.com' },
    assets: 3,
  },
  {
    id: 2,
    name: 'Globex LLC',
    org: '987654321',
    contact: { name: 'Jane Smith', email: 'jane@example.com' },
    assets: 1,
  },
];

export default function Customers() {
  const [customers] = useState(sampleCustomers);

  return (
    <Layout>
      <h1>Customers</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Org Number</th>
            <th>Contact</th>
            <th>Assets</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.org}</td>
              <td>
                <div>{c.contact.name}</div>
                <div className="small">{c.contact.email}</div>
              </td>
              <td>{c.assets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
