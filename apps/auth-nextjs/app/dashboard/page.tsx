'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nulvless } from '@/lib/nulvless';

interface Me {
  user: string;
  assuranceLevel: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    async function load() {
      const token = await nulvless.auth.getAccessToken();
      if (!token) return router.replace('/sign-in');

      const response = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return router.replace('/sign-in');

      setMe(await response.json());
    }

    load();
  }, [router]);

  async function signOut() {
    await nulvless.auth.signOut();
    router.push('/');
  }

  if (!me) {
    return (
      <div className="center" role="status">
        <span className="spinner" aria-label="Checking your session" />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            A
          </span>
          Acme
        </Link>
        <nav aria-label="Main">
          <Link href="/dashboard" aria-current="page">
            Dashboard
          </Link>
        </nav>
        <button type="button" className="button button-quiet" onClick={signOut}>
          Sign out
        </button>
      </header>

      <main className="page">
        <div className="page-heading">
          <h1>Dashboard</h1>
          <p className="muted">Your server checked the token with auth.verify before answering this page.</p>
        </div>

        <dl className="facts" aria-label="What the server verified">
          <div>
            <dt>User ID</dt>
            <dd>{me.user}</dd>
            <dd className="muted">From the verified token</dd>
          </div>
          <div>
            <dt>Assurance level</dt>
            <dd>{me.assuranceLevel}</dd>
            <dd className="muted">aal2 means a second factor was used</dd>
          </div>
          <div>
            <dt>Checked by</dt>
            <dd>app/api/me/route.ts</dd>
            <dd className="muted">With your secret key, on the server</dd>
          </div>
        </dl>

        <section className="placeholder" aria-label="Your product">
          <h2>Put your product here</h2>
          <p className="muted">
            This page is <code>app/dashboard/page.tsx</code>. Add route handlers like <code>app/api/me/route.ts</code>{' '}
            for anything that must stay on the server.
          </p>
        </section>
      </main>
    </div>
  );
}
