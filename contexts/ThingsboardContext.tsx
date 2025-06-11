import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Customer {
  id: string;
  title: string;
}

interface TbUser {
  id: string;
  email: string;
  name?: string;
}

interface ThingsboardContextType {
  customers: Customer[];
  users: TbUser[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ThingsboardContext = createContext<ThingsboardContextType | undefined>(undefined);

export function ThingsboardProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<TbUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        fetch('/api/thingsboard/tenants'),
        fetch('/api/thingsboard/users'),
      ]);

      if (!cRes.ok || !uRes.ok) {
        throw new Error('Failed to fetch Thingsboard data');
      }

      const cData = await cRes.json();
      const uData = await uRes.json();

      setCustomers(cData.data || cData);
      setUsers(uData.data || uData);
    } catch (err) {
      console.error('Error refreshing Thingsboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(err => console.error('Unhandled refresh error:', err));
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
