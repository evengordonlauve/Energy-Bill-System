import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Cost Calc', href: '/calculations/cost' },
  { label: 'Price Lists', href: '/calculations/price' },
  { label: 'Customers', href: '/customers' },
  { label: 'Checklists', href: '/checklists' },
  { label: 'Admin', href: '/admin' }
];

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <>
      <header className="header">
        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={logout} className="nav-link button-logout">
              Sign Out ({user.name})
            </button>
          ) : (
            <Link href="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
