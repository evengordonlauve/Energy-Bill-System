import { useState } from 'react';
import Layout from '../../components/Layout';

const defaultItems = [
  { id: '1', description: 'Grunpakke AES (pr bygg)', pricePerYear: 2880, qty: 0 },
  { id: '2', description: 'Ekstra Ethub målepunkt', pricePerYear: 1440, qty: 0 },
  { id: '3', description: 'Gateway for sensorer', pricePerYear: 720, qty: 0 },
];

export default function PriceLists() {
  const [items, setItems] = useState(defaultItems);

  const updateQty = (id, qty) => {
    setItems(items.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const total = items.reduce((sum, it) => sum + it.pricePerYear * it.qty, 0);

  return (
    <Layout>
      <h1>Price List</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Price / year</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.description}</td>
              <td>{it.pricePerYear} kr</td>
              <td>
                <input
                  type="number"
                  value={it.qty}
                  onChange={(e) => updateQty(it.id, parseInt(e.target.value) || 0)}
                  style={{ width: '60px' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total: {total} kr / year</p>
    </Layout>
  );
}
