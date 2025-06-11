import '../styles/globals.css';
import '../styles/login.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { ThingsboardProvider } from '../contexts/ThingsboardContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThingsboardProvider>
        <Component {...pageProps} />
      </ThingsboardProvider>
    </AuthProvider>
  );
}
