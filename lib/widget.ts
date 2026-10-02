import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { serviceDb } from './supabase';
import { allowedOrigin, id } from './validation';

export function corsHeaders(origin: string): Record<string,string> {
  return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'300','Vary':'Origin','Cache-Control':'no-store'};
}
export function json(data:unknown,status:number,origin?:string|null) {
  return NextResponse.json(data,{status,headers:{...(origin?corsHeaders(origin):{}),'Cache-Control':'no-store'}});
}
export async function context(request: NextRequest, key: string|null) {
  if(!key || !id.safeParse(key).success) return null;
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const db=serviceDb();
  const {data:workspace,error}=await db.from('workspaces').select('id,name,allowed_origins').eq('public_key',key).maybeSingle();
  if(error||!workspace) return null;
  const origin=allowedOrigin(request.headers.get('origin'),workspace.allowed_origins||[]);
  if(!origin) return null;
  return {db,workspace,origin};
}
export async function limited(request: NextRequest,workspaceId:string,kind:string,max:number) {
  const db=serviceDb();
  // This application-level throttle is not a replacement for an edge WAF.
  const ip=request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'unknown';
  const key=createHash('sha256').update(kind+':'+ip).digest('hex');
  const bucket=new Date(Math.floor(Date.now()/60000)*60000).toISOString();
  const {data,error}=await db.rpc('claim_widget_rate_limit',{p_workspace:workspaceId,p_key:key,p_bucket:bucket,p_max:max});
  return !error&&data===true;
}
