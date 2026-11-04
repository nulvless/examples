'use client';

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

  if (!me) return <p>Loading…</p>;

  return (
    <main>
      <h1>Dashboard</h1>
      <p>
        The server verified your token. You are <code>{me.user}</code>, signed in at <code>{me.assuranceLevel}</code>.
      </p>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
