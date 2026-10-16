/** Safe, non-reflective feedback for the server-side magic-link callback. */
export const AUTH_REDIRECT_FAILURE_NOTICE =
  'That sign-in link could not be verified. Request a fresh link and return to the same app address.';

export function getSignInRedirectNotice(search: string): string {
  const params = new URLSearchParams(search);
  return params.get('error') === 'auth' ? AUTH_REDIRECT_FAILURE_NOTICE : '';
}
