import Layout from '../../components/Layout';

const sampleUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 2, name: 'Regular User', email: 'user@example.com', role: 'User' }
];

export default function UserManagement() {
  return (
    <Layout>
      <h1>User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {sampleUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
