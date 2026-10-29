import {NextRequest} from 'next/server';
import {privateJson} from '@/lib/private-response';
import {authorizedDb} from '@/lib/supabase';
import {id} from '@/lib/validation';
import {setupStatus} from '@/lib/onboarding';

export const runtime='nodejs';

/** Authenticated, read-only setup evidence, based on real owner-visible rows. */
export async function GET(req:NextRequest) {
  const auth=await authorizedDb();
  if(!auth) return privateJson({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success) return privateJson({error:'Invalid workspace'},{status:400});
  const {data:workspace,error:workspaceError}=await auth.db.from('workspaces')
    .select('id,name,allowed_origins').eq('id',workspaceId).maybeSingle();
  if(workspaceError) return privateJson({error:'Could not load workspace'},{status:503});
  if(!workspace) return privateJson({error:'Workspace not found or not permitted'},{status:404});
  const {count,error:knowledgeError}=await auth.db.from('knowledge')
    .select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id);
  if(knowledgeError || count===null) return privateJson({error:'Could not verify knowledge count'},{status:503});
  return privateJson({
    workspaceId:workspace.id,
    knowledgeCount:count,
    ...setupStatus({
      workspaceName:workspace.name,
      allowedOrigins:workspace.allowed_origins||[],
      knowledgeCount:count,
    }),
  });
}
