import {NextRequest} from 'next/server';
import {privateJson} from '@/lib/private-response';
import {authorizedDb} from '@/lib/supabase';
import {id,retentionInput} from '@/lib/validation';

export const runtime='nodejs';
const noStore={'Cache-Control':'no-store'};

async function preview(auth: NonNullable<Awaited<ReturnType<typeof authorizedDb>>>, workspaceId:string, retentionDays:number){
  const cutoff=new Date(Date.now()-retentionDays*24*60*60*1000).toISOString();
  const {count,error}=await auth.db.from('conversations')
    .select('id',{count:'exact',head:true})
    .eq('workspace_id',workspaceId)
    .lt('created_at',cutoff);
  if(error)return {error:'Could not calculate retention preview'} as const;
  return {
    workspaceId,
    retentionDays,
    cutoff,
    eligibleConversationCount:count??0,
    previewOnly:true as const,
  };
}

export async function GET(req:NextRequest){
  const auth=await authorizedDb();
  if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return privateJson({error:'Invalid workspace'},{status:400});
  const {data,error}=await auth.db.from('workspaces')
    .select('id,conversation_retention_days')
    .eq('id',workspaceId)
    .maybeSingle();
  if(error||!data)return privateJson({error:'Workspace not found or not permitted'},{status:404,headers:noStore});
  const result=await preview(auth,data.id,data.conversation_retention_days);
  return privateJson(result,{status:'error' in result?503:200,headers:noStore});
}

export async function PATCH(req:NextRequest){
  const auth=await authorizedDb();
  if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const parsed=retentionInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return privateJson({error:'Invalid retention policy'},{status:400});
  const {data,error}=await auth.db.from('workspaces')
    .update({conversation_retention_days:parsed.data.retentionDays})
    .eq('id',parsed.data.workspaceId)
    .select('id,conversation_retention_days')
    .maybeSingle();
  if(error||!data)return privateJson({error:'Workspace not found or update failed'},{status:404,headers:noStore});
  const result=await preview(auth,data.id,data.conversation_retention_days);
  return privateJson(result,{status:'error' in result?503:200,headers:noStore});
}
