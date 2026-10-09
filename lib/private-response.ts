import {NextResponse} from 'next/server';

/** Mark every owner-console response, including errors, as non-cacheable. */
export function privateJson(body:unknown,init:ResponseInit={}):NextResponse {
  const headers=new Headers(init.headers);
  headers.set('Cache-Control','no-store');
  return NextResponse.json(body,{...init,headers});
}
