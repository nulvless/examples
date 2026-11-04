import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Nulvless auth with Next.js</h1>
      <p>Sign in with a user of your Nulvless project, then open the dashboard.</p>
      <p>
        <Link href="/sign-in">Sign in</Link> · <Link href="/dashboard">Dashboard</Link>
      </p>
    </main>
  );
}
