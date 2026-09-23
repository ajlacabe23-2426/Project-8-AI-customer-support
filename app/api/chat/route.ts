import { NextRequest, NextResponse } from 'next/server';
import { incomingChat } from '@/lib/validation';
import { context, json, limited, corsHeaders } from '@/lib/widget';
import { draftAnswer, fallback } from '@/lib/ai';

export const runtime='nodejs';
export async function OPTIONS(req:NextRequest) {
  const ctx=await context(req,req.nextUrl.searchParams.get('widgetKey'));
  return ctx ? new NextResponse(null,{status:204,headers:corsHeaders(ctx.origin)}) : json({error:'Origin not allowed'},403);
}
export async function POST(req:NextRequest) {
  const contentType=req.headers.get('content-type')||'';
  if(!contentType.includes('application/json')) return json({error:'JSON required'},415);
  const raw=await req.text();
  if(raw.length>5000) return json({error:'Request too large'},413);
  let incoming:unknown;
  try{incoming=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  const parsed=incomingChat.safeParse(incoming);
  if(!parsed.success) return json({error:'Invalid message'},400);
  const {widgetKey,visitorToken,message}=parsed.data;
  if(req.nextUrl.searchParams.get('widgetKey')!==widgetKey) return json({error:'Invalid widget key'},400);
  const ctx=await context(req,widgetKey);
  if(!ctx) return json({error:'Widget is not available for this site'},403);
  const {db,workspace,origin}=ctx;
  if(!await limited(req,workspace.id,'chat-ip',12) || !await limited(req,workspace.id,'chat-workspace',100))
    return json({error:'Rate limit reached. Please try again soon.'},429,origin);
  const {error:upsertError}=await db.from('conversations').upsert({workspace_id:workspace.id,visitor_token:visitorToken},{onConflict:'workspace_id,visitor_token',ignoreDuplicates:true});
  if(upsertError) return json({error:'Support is temporarily unavailable'},503,origin);
  const {data:conversation,error:lookupError}=await db.from('conversations').select('id,status').eq('workspace_id',workspace.id).eq('visitor_token',visitorToken).single();
  if(lookupError||!conversation) return json({error:'Support is temporarily unavailable'},503,origin);
  const {data:previous}=await db.from('messages').select('role,body').eq('conversation_id',conversation.id).order('created_at',{ascending:false}).limit(6);
  const {error:messageError}=await db.from('messages').insert({conversation_id:conversation.id,role:'user',body:message});
  if(messageError) return json({error:'Could not save message'},503,origin);
  const {data:knowledge,error:knowledgeError}=await db.from('knowledge').select('id,title,body').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(100);
  const answer=knowledgeError||conversation.status==='needs_human'
    ? fallback : await draftAnswer(message,knowledge||[],(previous||[]).reverse());
  const {error:replyError}=await db.from('messages').insert({conversation_id:conversation.id,role:'assistant',body:answer.answer});
  if(replyError) return json({error:'Could not save reply'},503,origin);
  if(answer.needsHuman) await db.from('conversations').update({status:'needs_human'}).eq('id',conversation.id);
  return json({answer:answer.answer,needsHuman:answer.needsHuman,sources:answer.sources},200,origin);
}
