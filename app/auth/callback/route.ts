import { NextRequest,NextResponse } from 'next/server';
import { userDb } from '@/lib/supabase';
export async function GET(request:NextRequest) {
  const code=request.nextUrl.searchParams.get('code');
  if(code) {
    const db=await userDb();
    const {error}=await db.auth.exchangeCodeForSession(code);
    if(!error) return NextResponse.redirect(new URL('/dashboard',request.url));
  }
  return NextResponse.redirect(new URL('/login?error=auth',request.url));
}
