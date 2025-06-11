import Layout from '../../components/Layout';
import { useQuotes } from '../../contexts/QuoteContext';

export default function QuoteList() {
  const { quotes } = useQuotes();

  return (
    <Layout>
      <h1>Saved Quotes</h1>
      <p>
        <a href="/quotes/new">Create New Quote</a>
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Seller</th>
            <th>Customer</th>
            <th>Total / year</th>
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 ? (
            <tr>
              <td colSpan={4}>No quotes saved yet.</td>
            </tr>
          ) : (
            quotes.map((q) => (
              <tr key={q.id}>
                <td>{q.name}</td>
                <td>{q.seller}</td>
                <td>{q.customerName}</td>
                <td>{q.total} kr</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Layout>
  );
}
