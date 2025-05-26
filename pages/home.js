import { parse } from 'cookie';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (!cookies.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const user = JSON.parse(Buffer.from(cookies.user, 'base64').toString('utf8'));
  return { props: { user } };
}

export default function Home({ user }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', background: '#f0f0f0', padding: '1rem' }}>
        <ul>
          <li><a href="/home">Dashboard</a></li>
          <li><a href="/user-settings">Innstillinger</a></li>
          <li><a href="/api/logout">Logg ut</a></li>
        </ul>
      </aside>
      <main style={{ flex: 1 }}>
        <div style={{ background: '#333', color: '#fff', padding: '0.5rem 1rem', display:'flex', justifyContent:'space-between' }}>
          <div>{user.username} ({user.group}{user.role==='admin' ? ' admin' : ''})</div>
          <a href="/user-settings" style={{ textDecoration:'underline' }}>Brukerinnstillinger</a>
        </div>
        <div style={{ padding:'1rem' }}>
          <h1>Velkommen {user.username}</h1>
        </div>
      </main>
    </div>
  );
}
