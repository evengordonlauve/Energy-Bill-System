import { ChangeEvent, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { useQuotes } from '../../contexts/QuoteContext';

interface PriceItem {
  id: string;
  description: string;
  price: number;
  qty: number;
}

const defaultItems: PriceItem[] = [
  { id: '1', description: 'Grunpakke AES (pr bygg)', price: 2880, qty: 0 },
  { id: '2', description: 'Ekstra Ethub målepunkt', price: 1440, qty: 0 },
  { id: '3', description: 'Gateway for sensorer', price: 720, qty: 0 },
];

export default function NewQuote() {
  const { user } = useAuth();
  const { customers, addCustomer } = useCustomers();
  const { addQuote } = useQuotes();

  const [items, setItems] = useState<PriceItem[]>(defaultItems);
  const [showForm, setShowForm] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState('');

  const updateQty = (id: string, qty: number) => {
    setItems(items.map(it => (it.id === id ? { ...it, qty } : it)));
  };

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const saveQuote = () => {
    let custId = customerId;
    let custName = '';
    if (customerId === 'new') {
      const c = addCustomer({ name: newCustomer });
      custId = c.id;
      custName = c.name;
    } else {
      const c = customers.find(c => c.id === customerId);
      custName = c?.name || '';
    }

    addQuote({
      id: Date.now().toString(),
      name: quoteName,
      seller: user?.name || '',
      customerId: custId,
      customerName: custName,
      items: items.filter(i => i.qty > 0),
      total,
    });
    setShowForm(false);
  };

  return (
    <Layout>
      <h1>Create Quote</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Price / year</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.description}</td>
              <td>{it.price} kr</td>
              <td>
                <input
                  type="number"
                  value={it.qty}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateQty(it.id, parseInt(e.target.value) || 0)
                  }
                  style={{ width: '60px' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total: {total} kr / year</p>

      <button className="button" onClick={() => window.print()}>Print / PDF</button>
      <button className="button" onClick={() => setShowForm(true)} style={{ marginLeft: '8px' }}>Save Quote</button>

      {showForm && (
        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Quote Name</label>
            <input value={quoteName} onChange={e => setQuoteName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Customer</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Select...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="new">New Customer</option>
            </select>
          </div>
          {customerId === 'new' && (
            <div className="form-group">
              <label>New Customer Name</label>
              <input value={newCustomer} onChange={e => setNewCustomer(e.target.value)} />
            </div>
          )}
          <button className="button" onClick={saveQuote}>Save</button>
        </div>
      )}
    </Layout>
  );
}
