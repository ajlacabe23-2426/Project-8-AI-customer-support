import type { CookieBatch } from '@/lib/cookie-types';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const EMAIL_LINK_TYPES = new Set<EmailOtpType>(['email', 'magiclink']);

export async function GET(request: NextRequest) {
  const failedRedirect = (stage: 'missing_code' | 'missing_config' | 'exchange_failed' | 'exception') => {
    // A relative Location preserves the browser origin for localhost session cookies.
    const response = new NextResponse(null, {
      status: 303,
      headers: { Location: `/login?error=auth&stage=${stage}` },
    });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  };

  const params = request.nextUrl.searchParams;
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type');

  // Support both Supabase PKCE code links and server-verified email token hashes.
  // Never accept ambiguous inputs, arbitrary OTP types or caller-selected redirect URLs.
  if (params.getAll('code').length > 1 || params.getAll('token_hash').length > 1 ||
      params.getAll('type').length > 1 || (code && tokenHash) ||
      (!code && !tokenHash) || (tokenHash && (!type || !EMAIL_LINK_TYPES.has(type as EmailOtpType)))) {
    return failedRedirect('missing_code');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return failedRedirect('missing_config');

  // Only the browser-visible success redirect receives the new session cookies.
  const redirect = new NextResponse(null, {
    status: 303,
    headers: { Location: '/dashboard' },
  });
  redirect.headers.set('Cache-Control', 'private, no-store');
  const db = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(values: CookieBatch) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        values.forEach(({ name, value, options }) =>
          redirect.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const { error } = tokenHash
      ? await db.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
      : await db.auth.exchangeCodeForSession(code!);
    return error ? failedRedirect('exchange_failed') : redirect;
  } catch {
    return failedRedirect('exception');
  }
}
