import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TbCustomer {
  id: string;
  title: string;
  /** Optional display name for compatibility with local Customer interface */
  name?: string;
  /** Optional organization number if available */
  org?: string;
  /** Optional primary contact details */
  contact?: { name: string; email: string };
  /** Optional asset count */
  assets?: number;
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
