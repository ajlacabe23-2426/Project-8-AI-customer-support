import type { CookieBatch } from './cookie-types';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function publicConfig() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase public environment variables are missing.');
  return {url,key};
}
export function browserDb() {
  const {url,key}=publicConfig();
  return createBrowserClient(url,key);
}
export async function userDb() {
  const {url,key}=publicConfig();
  const jar=await cookies();
  return createServerClient(url,key,{
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(values: CookieBatch) {
        try { values.forEach(({name,value,options})=>jar.set(name,value,options)); }
        catch { /* Server Components cannot set cookies; middleware refreshes sessions. */ }
      },
    },
  });
}
export function serviceDb() {
  const {url}=publicConfig();
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Server-side Supabase service key is missing.');
  return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
}
export async function authorizedDb() {
  const db=await userDb();
  const {data:{user},error}=await db.auth.getUser();
  return error || !user ? null : {db,user};
}
