import { describe, expect, it } from 'vitest';
import { AUTH_REDIRECT_FAILURE_NOTICE, getSignInRedirectNotice } from './auth-feedback';

describe('sign-in redirect feedback', () => {
  it('shows an actionable notice for an auth callback failure', () => {
    expect(getSignInRedirectNotice('?error=auth')).toBe(AUTH_REDIRECT_FAILURE_NOTICE);
  });

  it('does not reflect arbitrary query content to the login page', () => {
    expect(getSignInRedirectNotice('?error=other&message=%3Cscript%3E')).toBe('');
  });

  it('shows no notice for a normal login or unrelated query', () => {
    expect(getSignInRedirectNotice('')).toBe('');
    expect(getSignInRedirectNotice('?next=%2Fdashboard')).toBe('');
  });
});
