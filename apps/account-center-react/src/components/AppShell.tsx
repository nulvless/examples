import { NavLink, Outlet, useNavigate } from 'react-router';
import { initials } from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

export function AppShell() {
  const navigate = useNavigate();
  const { user } = useUser();

  async function signOut() {
    await nulvless.auth.signOut();
    navigate('/sign-in', { replace: true });
  }

  return (
    <div className="app">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden>
            A
          </span>
          Acme
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/account">Account</NavLink>
        </nav>
        <button type="button" className="button button-quiet" onClick={signOut}>
          Sign out
        </button>
        {user && (
          <NavLink to="/account" className="avatar" aria-label="Your account">
            {initials(user)}
          </NavLink>
        )}
      </header>
      <Outlet />
    </div>
  );
}
