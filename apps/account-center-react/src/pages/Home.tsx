import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Session } from '@nulvless/nulvless-js';
import { deviceName, displayName, methodNames, place, timeAgo } from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

export function Home() {
  const { user } = useUser();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    nulvless.auth.getSession().then(({ data }) => setSession(data));
  }, []);

  if (!user) return null;

  return (
    <main className="page">
      <div className="page-heading">
        <h1>Good to see you, {displayName(user)}</h1>
        <p className="muted">You are signed in. This is where your product starts.</p>
      </div>

      {session && (
        <dl className="facts" aria-label="This session">
          <div>
            <dt>This device</dt>
            <dd>{deviceName(session)}</dd>
            {place(session) && <dd className="muted">{place(session)}</dd>}
          </div>
          <div>
            <dt>Signed in with</dt>
            <dd>{methodNames(session) ?? 'Unknown'}</dd>
            <dd className="muted">{timeAgo(session.created_at)}</dd>
          </div>
          <div>
            <dt>Session ends</dt>
            <dd>{timeAgo(session.expires_at)}</dd>
            <dd className="muted">Unless you sign out first</dd>
          </div>
        </dl>
      )}

      <section className="placeholder" aria-label="Your product">
        <h2>Put your product here</h2>
        <p className="muted">
          This page is <code>src/pages/Home.tsx</code>. Everything inside the app shell already has a signed-in user:
          read it with <code>useUser()</code>, and send <code>auth.getAccessToken()</code> to your API.
        </p>
        <Link className="button button-quiet" to="/account">
          Open your account
        </Link>
      </section>
    </main>
  );
}
