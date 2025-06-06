import { FormEvent, ChangeEvent, useState } from 'react';
import Layout from '../../components/Layout';

const initialItems = [
  { id: 1, text: 'Inspect ventilation system', done: false },
  { id: 2, text: 'Check heating controls', done: false },
];

export default function Checklists() {
  const [items, setItems] = useState(initialItems);
  const [task, setTask] = useState('');

  const addItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task.trim()) return;
    setItems([...items, { id: Date.now(), text: task.trim(), done: false }]);
    setTask('');
  };

  const toggleItem = (id: number) => {
    setItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  return (
    <Layout>
      <h1>Checklists</h1>
      <form onSubmit={addItem} className="form-group">
        <label htmlFor="task">New Task</label>
        <input
          id="task"
          type="text"
          value={task}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTask(e.target.value)}
        />
        <button type="submit" className="button">Add</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
              />
              {item.text}
            </label>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
