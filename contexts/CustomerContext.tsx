import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Customer {
  id: string;
  name: string;
  org?: string;
  contact?: { name: string; email: string };
  assets?: number;
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('customers');
      if (stored) setCustomers(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
    const newCust = { id: Date.now().toString(), ...customer };
    setCustomers(prev => [...prev, newCust]);
    return newCust;
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers(): CustomerContextType {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be inside CustomerProvider');
  return ctx;
}
