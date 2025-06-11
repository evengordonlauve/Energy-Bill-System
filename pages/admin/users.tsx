import Layout from '../../components/Layout';
import { useThingsboard } from '../../contexts/ThingsboardContext';

export default function UserManagement() {
  const { users, loading } = useThingsboard();

  return (
    <Layout>
      <h1>User Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name || u.email}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
