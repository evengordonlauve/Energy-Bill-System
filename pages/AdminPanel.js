import { parse } from 'cookie';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const role = cookies.role;

  if (role !== 'developer') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function AdminPanel() {
  return (
    <main>
      <h1>Admin Panel</h1>
      <p>Only for developers.</p>
    </main>
  );
}
