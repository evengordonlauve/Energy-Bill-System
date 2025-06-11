import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface QuoteItem {
  id: string;
  description: string;
  price: number;
  qty: number;
}

export interface Quote {
  id: string;
  name: string;
  seller: string;
  customerId: string;
  customerName: string;
  items: QuoteItem[];
  total: number;
}

interface QuoteContextType {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('quotes');
      if (stored) setQuotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quotes', JSON.stringify(quotes));
    }
  }, [quotes]);

  const addQuote = (quote: Quote) => {
    setQuotes(prev => [...prev, quote]);
  };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuotes(): QuoteContextType {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuotes must be inside QuoteProvider');
  return ctx;
}
