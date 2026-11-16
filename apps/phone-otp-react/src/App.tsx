import { useEffect, useState } from 'react';
import type { Challenge, Phone } from '@nulvless/nulvless-js';
import { AuthLayout, type FlowStep } from '@/components/AuthLayout';
import { CodeStep } from '@/components/CodeStep';
import { PhoneStep } from '@/components/PhoneStep';
import { SignedIn } from '@/components/SignedIn';
import { nulvless } from '@/lib/nulvless';

const STEPS: FlowStep[] = [
  { title: 'Enter your phone', call: 'auth.signInWithOTP' },
  { title: 'Type the code', call: 'auth.verifyChallenge' },
  { title: 'Signed in', call: 'auth.users.me' },
];

type Stage = { name: 'loading' } | { name: 'phone' } | { name: 'code'; phone: Phone; challenge: Challenge } | { name: 'signed-in' };

export function App() {
  const [stage, setStage] = useState<Stage>({ name: 'loading' });
  const [phone, setPhone] = useState<Phone | null>(null);

  useEffect(() => {
    nulvless.auth.getSession().then(({ data }) => setStage(data ? { name: 'signed-in' } : { name: 'phone' }));
  }, []);

  if (stage.name === 'loading') {
    return (
      <div className="center" role="status">
        <span className="spinner" aria-label="Loading" />
      </div>
    );
  }

  const current = stage.name === 'phone' ? 0 : stage.name === 'code' ? 1 : 2;

  return (
    <AuthLayout steps={STEPS} current={current}>
      {stage.name === 'phone' && (
        <PhoneStep
          initial={phone}
          onSent={(sentTo, challenge) => {
            setPhone(sentTo);
            setStage({ name: 'code', phone: sentTo, challenge });
          }}
        />
      )}
      {stage.name === 'code' && (
        <CodeStep
          phone={stage.phone}
          challenge={stage.challenge}
          onResent={(challenge) => setStage({ ...stage, challenge })}
          onChangeNumber={() => setStage({ name: 'phone' })}
          onSignedIn={() => setStage({ name: 'signed-in' })}
        />
      )}
      {stage.name === 'signed-in' && <SignedIn onSignedOut={() => setStage({ name: 'phone' })} />}
    </AuthLayout>
  );
}
