import type { CookieBatch } from './lib/cookie-types';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request: NextRequest) {
  let response=NextResponse.next({request});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const db=createServerClient(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(values: CookieBatch) {
        values.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request});
        values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });
  await db.auth.getUser();
  return response;
}
export const config={matcher:['/dashboard/:path*','/auth/:path*','/api/admin/:path*']};
