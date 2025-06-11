import '../styles/globals.css';
import '../styles/login.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';

import { ThingsboardProvider } from '../contexts/ThingsboardContext';
import { CustomerProvider } from '../contexts/CustomerContext';
import { QuoteProvider } from '../contexts/QuoteContext';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThingsboardProvider>
        <CustomerProvider>
          <QuoteProvider>
            <Component {...pageProps} />
          </QuoteProvider>
        </CustomerProvider>
      </ThingsboardProvider>
    </AuthProvider>
  );
}
