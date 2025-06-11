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
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.id}>
              <td>{q.name}</td>
              <td>{q.seller}</td>
              <td>{q.customerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
