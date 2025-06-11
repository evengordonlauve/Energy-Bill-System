import Layout from "../../components/Layout";
import { useCustomers } from "../../contexts/CustomerContext";

export default function Customers() {
  const { customers } = useCustomers();

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
