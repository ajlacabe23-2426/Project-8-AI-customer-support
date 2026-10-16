import type { CookieBatch } from '@/lib/cookie-types';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const failedRedirect = () => {
    const response = NextResponse.redirect(new URL('/login?error=auth', request.url));
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  };

  const code = request.nextUrl.searchParams.get('code');
  if (!code) return failedRedirect();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return failedRedirect();

  // Attach session cookies to the redirect that actually goes to the browser.
  // Setting cookies on the incoming request alone cannot persist a new session.
  const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
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
    return error ? failedRedirect() : redirect;
  } catch {
    return failedRedirect();
  }
}
