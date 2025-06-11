import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TbCustomer {
  id: string;
  title: string;
}

interface TbUser {
  id: string;
  email: string;
  name?: string;
}

interface ThingsboardContextType {
  customers: TbCustomer[];
  users: TbUser[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ThingsboardContext = createContext<ThingsboardContextType | undefined>(undefined);

export function ThingsboardProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<TbCustomer[]>([]);
  const [users, setUsers] = useState<TbUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        fetch('/api/thingsboard/tenants'),
        fetch('/api/thingsboard/users'),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setCustomers(data.data || data);
      }
      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data.data || data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ThingsboardContext.Provider value={{ customers, users, loading, refresh }}>
      {children}
    </ThingsboardContext.Provider>
  );
}

export function useThingsboard(): ThingsboardContextType {
  const ctx = useContext(ThingsboardContext);
  if (!ctx) {
    throw new Error('useThingsboard must be used within ThingsboardProvider');
  }
  return ctx;
}
