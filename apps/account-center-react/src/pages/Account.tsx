import { useCallback, useEffect, useState } from 'react';
import type { Identity, NulvlessError, Session } from '@nulvless/nulvless-js';
import { KeyIcon, LaptopIcon, LinkIcon, MailIcon, PhoneIcon } from '@/components/Icons';
import { SudoDialog } from '@/components/SudoDialog';
import {
  deviceName,
  displayName,
  errorMessage,
  initials,
  isMobile,
  longDate,
  phoneNumber,
  place,
  signInMethods,
  timeAgo,
} from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

interface PendingAction {
  label: string;
  run: (code: string) => Promise<NulvlessError | null>;
}

function identityIcon(identity: Identity) {
  if (identity.type === 'email') return <MailIcon />;
  if (identity.type === 'phone') return <PhoneIcon />;
  return <LinkIcon />;
}

const PROVIDERS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  apple: 'Apple',
  microsoft: 'Microsoft',
  facebook: 'Facebook',
  gitlab: 'GitLab',
  discord: 'Discord',
  linkedin: 'LinkedIn',
  twitter: 'X',
};

function identityTitle(identity: Identity) {
  if (identity.type === 'email') return 'Email';
  if (identity.type === 'phone') return 'Phone';
  return (identity.provider && PROVIDERS[identity.provider]) ?? identity.provider ?? 'Social account';
}

export function Account() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [identities, setIdentities] = useState<Identity[] | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    const { data, error: listError } = await nulvless.auth.sessions.list();
    if (listError) return setError(errorMessage(listError, 'Could not load your sessions.'));
    setSessions(data.filter((session) => !session.invalidated));
  }, []);

  useEffect(() => {
    loadSessions();
    nulvless.auth.users.getIdentities().then(({ data }) => setIdentities(data ?? []));
  }, [loadSessions]);

  if (!user) return null;

  const others = sessions?.filter((session) => !session.is_current_session) ?? [];
  const ordered = sessions ? [...sessions].sort((a, b) => Number(b.is_current_session) - Number(a.is_current_session)) : [];

  async function finish(message: string) {
    setPending(null);
    setNotice(message);
    await loadSessions();
  }

  async function runProtected(action: PendingAction & { direct: () => Promise<NulvlessError | null>; done: string }) {
    setNotice(null);
    setError(null);
    const directError = await action.direct();
    if (!directError) return finish(action.done);
    if (directError.code !== 'protected_action_denied') return setError(errorMessage(directError, 'That did not work. Try again.'));
    setPending({
      label: action.label,
      run: async (code) => {
        const runError = await action.run(code);
        if (!runError) await finish(action.done);
        return runError;
      },
    });
  }

  function endSession(session: Session) {
    runProtected({
      label: `sign out ${deviceName(session)}`,
      done: `${deviceName(session)} was signed out.`,
      direct: async () => (await nulvless.auth.sessions.revoke({ id: session.id })).error,
      run: async (code) => (await nulvless.auth.sessions.revoke({ id: session.id, nonce: code })).error,
    });
  }

  async function revokeOthers() {
    for (const session of others) {
      const { error: revokeError } = await nulvless.auth.sessions.revoke({ id: session.id });
      if (revokeError) return revokeError;
    }
    return null;
  }

  function endOtherSessions() {
    runProtected({
      label: 'sign out of every other device',
      done: 'Every other device was signed out.',
      direct: revokeOthers,
      run: async (code) => {
        const { error: sudoError } = await nulvless.auth.sessions.sudoVerify({ code });
        return sudoError ?? revokeOthers();
      },
    });
  }

  return (
    <main className="page">
      <div className="page-heading">
        <h1>Your account</h1>
        <p className="muted">Your details, how you sign in, and where you are signed in.</p>
      </div>

      <div className="account">
        <nav className="account-nav" aria-label="Account sections">
          <a href="#profile">Profile</a>
          <a href="#sign-in-methods">Sign-in methods</a>
          <a href="#sessions">Sessions</a>
        </nav>

        <div className="account-sections">
          <section className="section" id="profile" aria-labelledby="profile-title">
            <div className="profile">
              <span className="avatar avatar-large">{initials(user)}</span>
              <div>
                <h2 id="profile-title" className="profile-name">
                  {displayName(user)}
                </h2>
                <p className="muted">Member since {longDate(user.created_at)}</p>
              </div>
            </div>
            <dl className="details">
              <dt>Email</dt>
              <dd>
                {user.email ?? 'Not set'}{' '}
                {user.email && <span className={user.is_confirmed ? 'badge' : 'badge badge-neutral'}>{user.is_confirmed ? 'Confirmed' : 'Not confirmed'}</span>}
              </dd>
              <dt>Phone</dt>
              <dd>{phoneNumber(user) ?? 'Not set'}</dd>
              <dt>Username</dt>
              <dd>{user.username ?? 'Not set'}</dd>
              <dt>Password</dt>
              <dd>{user.password_enabled ? 'Set' : 'Not set'}</dd>
              <dt>Last sign-in</dt>
              <dd>{timeAgo(user.last_sign_in_at)}</dd>
            </dl>
          </section>

          <section className="section" id="sign-in-methods" aria-labelledby="methods-title">
            <div className="section-heading">
              <div>
                <h2 id="methods-title">Sign-in methods</h2>
                <p className="muted">Every way you can prove it's you. They all lead to this one account.</p>
              </div>
            </div>
            <ul className="rows">
              {user.password_enabled && (
                <li className="row">
                  <span className="row-icon">
                    <KeyIcon />
                  </span>
                  <div className="row-main">
                    <span className="row-title">Password</span>
                    <span className="row-detail">Used together with your email</span>
                  </div>
                </li>
              )}
              {identities?.map((identity) => (
                <li className="row" key={identity.id}>
                  <span className="row-icon">{identityIcon(identity)}</span>
                  <div className="row-main">
                    <span className="row-title">{identityTitle(identity)}</span>
                    <span className="row-detail">
                      {identity.identifier}
                      {identity.created_at && `, added ${timeAgo(identity.created_at)}`}
                    </span>
                  </div>
                </li>
              ))}
              {identities === null && (
                <li className="row">
                  <span className="row-detail">Loading…</span>
                </li>
              )}
            </ul>
          </section>

          <section className="section" id="sessions" aria-labelledby="sessions-title">
            <div className="section-heading">
              <div>
                <h2 id="sessions-title">Sessions</h2>
                <p className="muted">Devices signed in to your account. Sign out any you don't recognize.</p>
              </div>
              {others.length > 0 && (
                <button type="button" className="button button-danger" onClick={endOtherSessions}>
                  Sign out other devices
                </button>
              )}
            </div>
            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            {error && (
              <p className="alert" role="alert">
                {error}
              </p>
            )}
            <ul className="rows">
              {sessions === null && !error && (
                <li className="row">
                  <span className="row-detail">Loading…</span>
                </li>
              )}
              {ordered.map((session) => (
                <li className="row" key={session.id} data-current={session.is_current_session ? '' : undefined}>
                  <span className="row-icon">{isMobile(session) ? <PhoneIcon /> : <LaptopIcon />}</span>
                  <div className="row-main">
                    <span className="row-title">
                      {deviceName(session)}
                      {session.is_current_session && <span className="badge">This device</span>}
                      {session.sudo_expires_at && new Date(session.sudo_expires_at) > new Date() && (
                        <span className="badge badge-neutral">Confirmed recently</span>
                      )}
                    </span>
                    {place(session) && <span className="row-detail">{place(session)}</span>}
                    <span className="row-detail">
                      {[signInMethods(session), `started ${timeAgo(session.created_at)}`].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  {!session.is_current_session && (
                    <button type="button" className="button button-quiet" onClick={() => endSession(session)}>
                      Sign out
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <SudoDialog action={pending?.label ?? null} onCancel={() => setPending(null)} onConfirm={(code) => pending!.run(code)} />
    </main>
  );
}
