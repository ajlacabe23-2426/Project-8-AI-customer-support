import {privateJson} from '@/lib/private-response';
import {NextRequest} from 'next/server';
import { authorizedDb } from '@/lib/supabase';
import { id,replyInput } from '@/lib/validation';
export const runtime='nodejs';
export async function GET(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return privateJson({error:'Invalid workspace'},{status:400});
  const {data,error}=await auth.db.from('conversations').select('id,status,created_at,messages(id,role,body,created_at)').eq('workspace_id',workspaceId).order('created_at',{ascending:false}).limit(50);
  return privateJson(error?{error:'Could not load inbox'}:{conversations:data||[]},{status:error?503:200,headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const parsed=replyInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return privateJson({error:'Invalid reply'},{status:400});
  const {data:conversation,error:lookupError}=await auth.db.from('conversations').select('id').eq('id',parsed.data.conversationId).maybeSingle();
  if(lookupError||!conversation)return privateJson({error:'Conversation not found'},{status:404});
  const {error}=await auth.db.from('messages').insert({conversation_id:conversation.id,role:'human',body:parsed.data.body});
  if(error)return privateJson({error:'Could not save reply'},{status:403});
  const {error:statusError}=await auth.db.from('conversations').update({status:'open'}).eq('id',conversation.id);
  return privateJson(statusError?{error:'Reply saved but could not update status'}:{saved:true},{status:statusError?503:201});
}

/** Owner-initiated privacy deletion; the database cascades associated messages. */
export async function DELETE(req:NextRequest) {
  const auth=await authorizedDb();
  if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const conversationId=req.nextUrl.searchParams.get('conversationId');
  if(!id.safeParse(conversationId).success)
    return privateJson({error:'Invalid conversation'},{status:400});
  const {data,error}=await auth.db.from('conversations').delete()
    .eq('id',conversationId).select('id').maybeSingle();
  return privateJson(error||!data?{error:'Conversation not found or not permitted'}:{deleted:true},
    {status:error||!data?404:200,headers:{'Cache-Control':'no-store'}});
}
