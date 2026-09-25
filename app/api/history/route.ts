import { NextRequest } from 'next/server';
import { context, json, limited, corsHeaders } from '@/lib/widget';
import { historyRequest } from '@/lib/validation';
export const runtime='nodejs';
// Session capabilities must not be placed in URLs, referrers, or access logs.
export async function OPTIONS(req:NextRequest) {
  const ctx=await context(req,req.nextUrl.searchParams.get('widgetKey'));
  return ctx ? new Response(null,{status:204,headers:corsHeaders(ctx.origin)}) : json({error:'Origin not allowed'},403);
}
export async function POST(req:NextRequest) {
  if(!(req.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json({error:'JSON required'},415);
  const raw=await req.text();
  if(raw.length>256)return json({error:'Request too large'},413);
  let input:unknown;
  try{input=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  const parsed=historyRequest.safeParse(input);
  if(!parsed.success)return json({error:'Invalid session'},400);
  const {widgetKey,visitorToken}=parsed.data;
  if(req.nextUrl.searchParams.get('widgetKey')!==widgetKey)return json({error:'Invalid widget key'},400);
  const ctx=await context(req,widgetKey);
  if(!ctx)return json({error:'Widget is not available for this site'},403);
  const {db,workspace,origin}=ctx;
  if(!await limited(req,workspace.id,'history-workspace',100))return json({error:'Rate limit reached'},429,origin);
  const {data:conversation,error}=await db.from('conversations').select('id,status').eq('workspace_id',workspace.id).eq('visitor_token',visitorToken).maybeSingle();
  if(error)return json({error:'History unavailable'},503,origin);
  if(!conversation)return json({messages:[],status:'open'},200,origin);
  const {data:messages,error:messageError}=await db.from('messages').select('id,role,body,created_at').eq('conversation_id',conversation.id).order('created_at',{ascending:false}).limit(50);
  if(messageError)return json({error:'History unavailable'},503,origin);
  return json({messages:(messages||[]).reverse(),status:conversation.status},200,origin);
}
