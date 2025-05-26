import { parse } from 'cookie';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const destination = cookies.user ? '/home' : '/login';
  return { redirect: { destination, permanent: false } };
}

export default function Index() { return null; }
