import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

type TestCookie = { name: string; value: string; options?: { path?: string; httpOnly?: boolean } };
const mocks = vi.hoisted(() => ({
  exchangeCode: vi.fn(),
  cookieAdapter: null as null | {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (items: TestCookie[]) => void;
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    settings: { cookies: NonNullable<typeof mocks.cookieAdapter> },
  ) => {
    mocks.cookieAdapter = settings.cookies;
    return { auth: { exchangeCodeForSession: mocks.exchangeCode } };
  },
}));

import { GET } from './route';

const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

beforeEach(() => {
  mocks.exchangeCode.mockReset();
  mocks.cookieAdapter = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'synthetic-public-key';
});

afterEach(() => {
  if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
});

describe('magic-link callback response cookies', () => {
  it('redirects missing-code requests to login without starting an exchange', async () => {
    const request = new NextRequest('http://127.0.0.1:3118/auth/callback');
    const response = await GET(request);
    expect(response.headers.get('location')).toBe('/login?error=auth&stage=missing_code');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(mocks.cookieAdapter).toBeNull();
  });

  it('writes successful exchange cookies to the actual dashboard redirect', async () => {
    mocks.exchangeCode.mockImplementation(async (code: string) => {
      expect(code).toBe('synthetic-code');
      const cookieNames = mocks.cookieAdapter?.getAll().map((cookie) => cookie.name);
      expect(cookieNames).toContain('sb-test-code-verifier');
      mocks.cookieAdapter?.setAll([
        { name: 'sb-test-auth-token', value: 'synthetic-token', options: { path: '/', httpOnly: true } },
      ]);
      return { error: null };
    });
    const request = new NextRequest(
      'http://127.0.0.1:3118/auth/callback?code=synthetic-code',
      { headers: { cookie: 'sb-test-code-verifier=synthetic-verifier' } },
    );
    const response = await GET(request);
    expect(response.headers.get('location')).toBe('/dashboard');
    expect(response.cookies.get('sb-test-auth-token')?.value).toBe('synthetic-token');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('preserves the browser hostname when NextRequest normalizes its origin', async () => {
    mocks.exchangeCode.mockImplementation(async () => {
      mocks.cookieAdapter?.setAll([
        { name: 'sb-test-auth-token', value: 'synthetic-token', options: { path: '/' } },
      ]);
      return { error: null };
    });
    for (const host of ['127.0.0.1', 'localhost']) {
      const request = new NextRequest(
        `http://${host}:3118/auth/callback?code=synthetic-code`,
      );
      const response = await GET(request);
      // Absolute redirects can strand a 127.0.0.1 session on localhost.
      // Relative Location resolves on the actual browser origin, not a normalized request.url.
      expect(response.headers.get('location')).toBe('/dashboard');
      expect(response.status).toBe(303);
      expect(response.cookies.get('sb-test-auth-token')?.value).toBe('synthetic-token');
    }
  });

  it('does not propagate session cookies or raw errors after a failed exchange', async () => {
    mocks.exchangeCode.mockImplementation(async () => {
      mocks.cookieAdapter?.setAll([
        { name: 'sb-test-auth-token', value: 'discard-this-cookie', options: { path: '/' } },
      ]);
      return { error: { message: 'do-not-show-raw-auth-error' } };
    });
    const request = new NextRequest('http://127.0.0.1:3118/auth/callback?code=invalid-code');
    const response = await GET(request);
    expect(response.headers.get('location')).toBe('/login?error=auth&stage=exchange_failed');
    expect(response.cookies.get('sb-test-auth-token')).toBeUndefined();
    expect(response.headers.get('location')).not.toContain('do-not-show');
  });

  it('identifies missing local public configuration without calling auth', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const request = new NextRequest('http://127.0.0.1:3118/auth/callback?code=test-code');
    const response = await GET(request);
    expect(response.headers.get('location')).toBe(
      '/login?error=auth&stage=missing_config',
    );
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
    expect(response.cookies.getAll()).toHaveLength(0);
  });

  it('fails closed when the auth provider throws', async () => {
    mocks.exchangeCode.mockRejectedValue(new Error('provider down'));
    const request = new NextRequest('http://127.0.0.1:3118/auth/callback?code=synthetic-code');
    const response = await GET(request);
    expect(response.headers.get('location')).toBe('/login?error=auth&stage=exception');
    expect(response.cookies.getAll()).toHaveLength(0);
  });
});
