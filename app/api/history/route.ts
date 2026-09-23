import { NextRequest } from 'next/server';
import { context,json,limited } from '@/lib/widget';
import { id } from '@/lib/validation';
export const runtime='nodejs';
export async function GET(req:NextRequest) {
  const key=req.nextUrl.searchParams.get('widgetKey'), token=req.nextUrl.searchParams.get('visitorToken');
  if(!id.safeParse(token).success) return json({error:'Invalid session'},400);
  const ctx=await context(req,key);
  if(!ctx) return json({error:'Widget is not available for this site'},403);
  const {db,workspace,origin}=ctx;
  if(!await limited(req,workspace.id,'history-ip',60)) return json({error:'Rate limit reached'},429,origin);
  const {data:conversation,error}=await db.from('conversations').select('id,status').eq('workspace_id',workspace.id).eq('visitor_token',token).maybeSingle();
  if(error) return json({error:'History unavailable'},503,origin);
  if(!conversation) return json({messages:[],status:'open'},200,origin);
  const {data:messages,error:messageError}=await db.from('messages').select('id,role,body,created_at').eq('conversation_id',conversation.id).order('created_at',{ascending:false}).limit(50);
  if(messageError) return json({error:'History unavailable'},503,origin);
  return json({messages:(messages||[]).reverse(),status:conversation.status},200,origin);
}
