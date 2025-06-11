import Layout from "../../components/Layout";
import { useThingsboard } from "../../contexts/ThingsboardContext";

export default function Customers() {
  const { customers, loading } = useThingsboard();

  return (
    <Layout>
      <h1>Customers</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
