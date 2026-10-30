import { describe, expect, it } from 'vitest';
import { AUTH_REDIRECT_FAILURE_NOTICE, getEmailSignInFailureNotice, getSignInRedirectNotice } from './auth-feedback';

describe('sign-in redirect feedback', () => {
  it('keeps the generic failure for an unspecified stage', () => {
    expect(getSignInRedirectNotice('?error=auth')).toBe(AUTH_REDIRECT_FAILURE_NOTICE);
  });

  it.each(['missing_code','missing_config','exchange_failed','exception','no_session'])(
    'provides a fixed explanation for %s',
    (stage) => {
      const message = getSignInRedirectNotice('?error=auth&stage=' + stage);
      expect(message).toContain('Sign-in diagnostic:');
      expect(message).not.toEqual(AUTH_REDIRECT_FAILURE_NOTICE);
    },
  );

  it('does not reflect arbitrary user-provided URLs, tokens or errors', () => {
    const payload = 'arbitrary-token-value';
    const search = '?error=auth&stage=' + encodeURIComponent(payload) +
      '&message=' + encodeURIComponent('<script>' + payload + '</script>');
    const message = getSignInRedirectNotice(search);
    expect(message).toBe(AUTH_REDIRECT_FAILURE_NOTICE);
    expect(message).not.toContain(payload);
  });

  it('does not display a sign-in error for normal browsing', () => {
    expect(getSignInRedirectNotice('')).toBe('');
    expect(getSignInRedirectNotice('?next=%2Fdashboard')).toBe('');
    expect(getSignInRedirectNotice('?stage=no_session')).toBe('');
  });
});

describe('Project 8 email sign-in request feedback', () => {
  it('identifies absent local Supabase authentication configuration', () => {
    expect(getEmailSignInFailureNotice(new Error('Supabase public environment variables are missing.')))
      .toContain('configuration is missing');
  });
  it('identifies rejected project API credentials', () => {
    expect(getEmailSignInFailureNotice({status:401})).toContain('public API key');
    expect(getEmailSignInFailureNotice(new Error('Invalid API key'))).toContain('public API key');
  });
  it('identifies email provider rate limits', () => {
    expect(getEmailSignInFailureNotice({status:429})).toContain('limited sign-in emails');
  });
  it('distinguishes Safari network errors from missing configuration', () => {
    expect(getEmailSignInFailureNotice(new TypeError('Load failed'))).toContain('could not reach Supabase Auth');
  });
  it('never reflects raw exceptions or credential strings to the browser', () => {
    const sensitiveValue = 'sensitive-value-in-network-exception';
    const message = getEmailSignInFailureNotice(new Error('Unexpected: '+sensitiveValue));
    expect(message).not.toContain(sensitiveValue);
    expect(message).toContain('sign-in request failed');
  });
});
