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
