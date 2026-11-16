import type { NulvlessError } from '@nulvless/nulvless-js';

export function errorMessage(error: NulvlessError, fallback: string) {
  if (error.code === 'rate_limit_exceeded') return 'Too many codes requested. Wait a minute and try again.';
  if (error.code === 'network_error' || error.code === 'request_timeout') return 'Could not reach the server. Check your connection and try again.';
  if (error.code === 'not_allowed' || error.code === 'service_not_enabled') return 'Sign-in by SMS is not turned on for this app yet.';
  return fallback;
}
