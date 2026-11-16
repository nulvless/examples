import type { FlowStep } from '@/components/AuthLayout';

export const SIGN_IN_STEPS: FlowStep[] = [
  { title: 'Sign in', call: 'auth.signIn' },
  { title: 'Confirm a second factor', call: 'auth.verifyChallenge' },
  { title: 'Use the product', call: 'auth.users.me' },
];

export const SIGN_UP_STEPS: FlowStep[] = [
  { title: 'Create an account', call: 'auth.signUp' },
  { title: 'Confirm your email', call: 'auth.verifyChallenge' },
  { title: 'Use the product', call: 'auth.users.me' },
];
