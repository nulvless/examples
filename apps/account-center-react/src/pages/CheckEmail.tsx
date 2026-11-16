import { Link, useLocation } from 'react-router';
import { AuthLayout } from '@/components/AuthLayout';
import { SIGN_UP_STEPS } from '@/lib/flows';

export function CheckEmail() {
  const email = (useLocation().state as { email?: string } | null)?.email;

  return (
    <AuthLayout steps={SIGN_UP_STEPS} current={1}>
      <div className="auth-heading">
        <h1>Check your email</h1>
        <p className="muted">
          We sent a confirmation link to {email ?? 'your email address'}. Open it on this device to finish creating your
          account, then sign in.
        </p>
      </div>
      <Link className="button button-quiet button-wide" to="/sign-in">
        Go to sign in
      </Link>
    </AuthLayout>
  );
}
