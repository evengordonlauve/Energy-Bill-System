import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
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

export default function ChecklistAdmin() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setChecklists(JSON.parse(stored) as Checklist[]);
    }
  }, [isAdmin, router]);

  const save = (items: Checklist[]) => {
    setChecklists(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  };

  const addChecklist = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    const items = [
      ...checklists,
      { id: Date.now(), title: title.trim(), done: false },
    ];
    setTitle("");
    save(items);
  };

  const remove = (id: number) => {
    const items = checklists.filter((c) => c.id !== id);
    save(items);
  };

  if (!isAdmin) {
    return (
      <Layout>
        <p>Access Denied</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>Checklist Tool</h1>
      <form onSubmit={addChecklist} className="form-group">
        <label htmlFor="title">New Checklist</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />
        <button type="submit" className="button">
          Create
        </button>
      </form>
      <ul>
        {checklists.map((c) => (
          <li key={c.id}>
            {c.title}
            <button className="button" onClick={() => remove(c.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

