import { NextRequest, NextResponse } from 'next/server';
import { authorizedDb } from '@/lib/supabase';
import { id,replyInput } from '@/lib/validation';
export const runtime='nodejs';
export async function GET(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return NextResponse.json({error:'Invalid workspace'},{status:400});
  const {data,error}=await auth.db.from('conversations').select('id,status,created_at,messages(id,role,body,created_at)').eq('workspace_id',workspaceId).order('created_at',{ascending:false}).limit(50);
  return NextResponse.json(error?{error:'Could not load inbox'}:{conversations:data||[]},{status:error?503:200,headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const parsed=replyInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid reply'},{status:400});
  const {data:conversation,error:lookupError}=await auth.db.from('conversations').select('id').eq('id',parsed.data.conversationId).maybeSingle();
  if(lookupError||!conversation)return NextResponse.json({error:'Conversation not found'},{status:404});
  const {error}=await auth.db.from('messages').insert({conversation_id:conversation.id,role:'human',body:parsed.data.body});
  if(error)return NextResponse.json({error:'Could not save reply'},{status:403});
  const {error:statusError}=await auth.db.from('conversations').update({status:'open'}).eq('id',conversation.id);
  return NextResponse.json(statusError?{error:'Reply saved but could not update status'}:{saved:true},{status:statusError?503:201});
}
