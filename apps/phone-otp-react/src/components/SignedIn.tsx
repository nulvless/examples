import { useEffect, useState } from 'react';
import type { User } from '@nulvless/nulvless-js';
import { nulvless } from '@/lib/nulvless';

interface SignedInProps {
  onSignedOut: () => void;
}

export function SignedIn({ onSignedOut }: SignedInProps) {
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    nulvless.auth.users.me().then(({ data }) => setUser(data));
  }, []);

  async function signOut() {
    setSigningOut(true);
    await nulvless.auth.signOut();
    onSignedOut();
  }

  const phone = user?.phone ? `${user.phone.country_code} ${user.phone.number}` : null;

  return (
    <>
      <div className="auth-heading">
        <h1>You're in</h1>
        <p className="muted">The code checked out, so this browser now holds a session for your account.</p>
      </div>
      <dl className="details">
        <dt>Phone</dt>
        <dd>{phone ?? '…'}</dd>
        <dt>Name</dt>
        <dd>{user ? (user.profile?.name ?? 'Not set') : '…'}</dd>
        <dt>User ID</dt>
        <dd>{user?.id ?? '…'}</dd>
      </dl>
      <p className="muted">
        Replace this screen with your product. Send <code>auth.getAccessToken()</code> to your API to act as this user.
      </p>
      <button type="button" className="button button-quiet button-wide" onClick={signOut} disabled={signingOut}>
        {signingOut && <span className="spinner" aria-hidden />}
        Sign out
      </button>
    </>
  );
}
