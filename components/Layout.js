import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Cost Calc', href: '/calculations/cost' },
  { label: 'Price Lists', href: '/calculations/price' },
  { label: 'Customers', href: '/customers' },
  { label: 'Checklists', href: '/checklists' },
  { label: 'Admin', href: '/admin' }
];

export default function Layout({ children }) {
  return (
    <>
      <header className="header">
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
