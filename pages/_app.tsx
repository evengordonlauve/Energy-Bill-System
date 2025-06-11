import '../styles/globals.css';
import '../styles/login.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { CustomerProvider } from '../contexts/CustomerContext';
import { QuoteProvider } from '../contexts/QuoteContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CustomerProvider>
        <QuoteProvider>
          <Component {...pageProps} />
        </QuoteProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}
