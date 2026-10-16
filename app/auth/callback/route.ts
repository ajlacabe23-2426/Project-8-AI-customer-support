import type { CookieBatch } from '@/lib/cookie-types';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const failedRedirect = (stage: 'missing_code' | 'missing_config' | 'exchange_failed' | 'exception') => {
    // Relative Location prevents a server-side hostname normalization from
    // changing the browser's cookie origin (localhost is not 127.0.0.1).
    const response = new NextResponse(null, {
      status: 303,
      headers: { Location: `/login?error=auth&stage=${stage}` },
    });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  };

  const code = request.nextUrl.searchParams.get('code');
  if (!code) return failedRedirect('missing_code');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return failedRedirect('missing_config');

  // Attach session cookies to the redirect that actually goes to the browser.
  // Setting cookies on the incoming request alone cannot persist a new session.
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
    const { error } = await db.auth.exchangeCodeForSession(code);
    return error ? failedRedirect('exchange_failed') : redirect;
  } catch {
    return failedRedirect('exception');
  }
}
