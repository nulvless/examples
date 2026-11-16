import Link from 'next/link';
import { AuthLayout } from '@/app/components/AuthLayout';

export default function Home() {
  return (
    <AuthLayout current={0}>
      <div className="auth-heading">
        <h1>Acme, with Nulvless and Next.js</h1>
        <p className="muted">
          Sign in with a user of your Nulvless project. The dashboard then asks your own route handler who you are, and
          the server checks the token before answering.
        </p>
      </div>
      <div className="stack">
        <Link className="button button-primary button-wide" href="/sign-in">
          Sign in
        </Link>
        <Link className="button button-quiet button-wide" href="/dashboard">
          Open the dashboard
        </Link>
      </div>
    </AuthLayout>
  );
}
