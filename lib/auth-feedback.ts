/** Only fixed, non-reflective messages; never interpolate auth error details or tokens. */
export const AUTH_REDIRECT_FAILURE_NOTICE =
  'That sign-in link could not be verified. Request a fresh link and return to the same app address.';

const STAGE_NOTICES: Record<string, string> = {
  missing_code:
    'Sign-in diagnostic: the callback did not receive an authorization code. Do not retry yet; check the email-link destination and browser origin.',
  missing_config:
    'Sign-in diagnostic: the application is missing its local public authentication configuration.',
  exchange_failed:
    'Sign-in diagnostic: an authorization code arrived, but the session exchange was rejected. Confirm the link and its original browser profile match.',
  exception:
    'Sign-in diagnostic: the authorization-code exchange could not complete.',
  no_session:
    'Sign-in diagnostic: the dashboard could not verify an authenticated session after navigation.',
};

export function getSignInRedirectNotice(search: string): string {
  const params = new URLSearchParams(search);
  if (params.get('error') !== 'auth') return '';
  const stage = params.get('stage') || '';
  return Object.prototype.hasOwnProperty.call(STAGE_NOTICES, stage)
    ? STAGE_NOTICES[stage]
    : AUTH_REDIRECT_FAILURE_NOTICE;
}


/** Fixed, non-reflective sign-in errors. Do not display tokens or raw exceptions. */
export function getEmailSignInFailureNotice(error: unknown): string {
  const detail = error instanceof Error ? error.message : '';
  const status = error && typeof error === 'object' && 'status' in error
    ? (error as { status?: unknown }).status
    : undefined;
  if (/Supabase public environment variables are missing/i.test(detail)) {
    return 'Sign-in configuration is missing. Check the Project 8 Supabase URL and public API key in .env.local, then restart Next.js.';
  }
  if (status === 401 || status === 403 || /invalid api key|invalid jwt/i.test(detail)) {
    return 'Project 8 Supabase rejected the public API key. Copy this project\'s anon key from Supabase API Keys into NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart Next.js.';
  }
  if (status === 429 || /rate limit|too many requests/i.test(detail)) {
    return 'Supabase has temporarily limited sign-in emails. Check Authentication email delivery and rate limits before requesting another link.';
  }
  if (/failed to fetch|load failed|networkerror|network request failed|fetch failed/i.test(detail)) {
    return 'The browser could not reach Supabase Auth. Verify the Project 8 URL, then check Safari Network for the failed /auth/v1/otp request and any network or content-blocker errors.';
  }
  return 'The sign-in request failed. Check Safari Network for the /auth/v1/otp response and Supabase Auth logs.';
}
