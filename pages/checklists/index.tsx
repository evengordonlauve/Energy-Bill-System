import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";

interface Checklist {
  id: number;
  title: string;
  done: boolean;
  doneBy?: string;
  doneAt?: string;
}

const STORAGE_KEY = "checklists";

export default function Checklists() {
  const { user: authUser } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [editTitles, setEditTitles] = useState<Record<number, string>>({});

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChecklists(JSON.parse(stored) as Checklist[]);
      }
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
    }
  }, [checklists, loaded]);

  const toggleDone = (id: number) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.done) {
          return { id: c.id, title: c.title, done: false };
        }
        return {
          ...c,
          done: true,
          doneBy: authUser?.name || "Unknown",
          doneAt: new Date().toISOString(),
        };
      }),
    );
  };

  const handleEditChange = (id: number, val: string) => {
    setEditTitles((prev) => ({ ...prev, [id]: val }));
  };

  const saveTitle = (id: number) => {
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitles[id] ?? c.title } : c)),
    );
  };

  return (
    <Layout>
      <h1>Checklists</h1>
      <h2>Available</h2>
      <ul>
        {checklists.filter((c) => !c.done).map((c) => (
          <li key={c.id}>
            {c.title}{" "}
            <button className="button" onClick={() => toggleDone(c.id)}>
              Mark Done
            </button>
          </li>
        ))}
      </ul>
      <h2>Completed</h2>
      <ul>
        {checklists.filter((c) => c.done).map((c) => (
          <li key={c.id}>
            <input
              type="text"
              value={editTitles[c.id] ?? c.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEditChange(c.id, e.target.value)
              }
            />
            <button className="button" onClick={() => saveTitle(c.id)}>
              Save
            </button>
            <button className="button" onClick={() => toggleDone(c.id)}>
              Undo
            </button>
            <div className="small">
              Signed {c.doneBy} on {new Date(c.doneAt || "").toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

