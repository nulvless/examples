import { codeChallenge, randomToken } from './pkce.ts';

export interface OAuthConfig {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface PendingSignIn {
  state: string;
  verifier: string;
}

export interface Tokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
}

export function startSignIn(config: OAuthConfig): { url: string; pending: PendingSignIn } {
  const pending = { state: randomToken(), verifier: randomToken() };
  const url = new URL(`${config.issuer}/oauth/authorize`);

  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', pending.state);
  url.searchParams.set('code_challenge', codeChallenge(pending.verifier));
  url.searchParams.set('code_challenge_method', 'S256');

  return { url: url.toString(), pending };
}

export async function exchangeCode(config: OAuthConfig, code: string, verifier: string): Promise<Tokens> {
  const response = await fetch(`${config.issuer}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
      client_id: config.clientId,
      ...(config.clientSecret ? { client_secret: config.clientSecret } : {}),
    }),
  });
  if (!response.ok) throw new Error(`The token exchange answered ${response.status}.`);

  return response.json() as Promise<Tokens>;
}

export async function fetchUserInfo(config: OAuthConfig, accessToken: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${config.issuer}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`The userinfo endpoint answered ${response.status}.`);

  return response.json() as Promise<Record<string, unknown>>;
}
