import Layout from "../../components/Layout";
import { useThingsboard } from "../../contexts/ThingsboardContext";

export default function Customers() {
  const { customers, loading } = useThingsboard();

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

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
              <td>{c.name || c.title || 'Unknown'}</td>
              <td>{c.org || ''}</td>
              <td>
                {c.contact && (
                  <>
                    <div>{c.contact.name}</div>
                    <div className="small">{c.contact.email}</div>
                  </>
                )}
              </td>
              <td>{c.assets || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
