import {NextRequest} from 'next/server';
import {privateJson} from '@/lib/private-response';
import {authorizedDb} from '@/lib/supabase';
import {id} from '@/lib/validation';

export const runtime='nodejs';

/**
 * Exact all-time counts of an owner's own workspace records.
 * No contact details, message bodies, visitor capabilities or model prompts.
 * This is an operational dashboard, NOT metered billing or a trial quota.
 */
export async function GET(req:NextRequest) {
  const auth=await authorizedDb();
  if(!auth)return privateJson({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return privateJson({error:'Invalid workspace'},{status:400});
  const {data:workspace,error:workspaceError}=await auth.db.from('workspaces')
    .select('id').eq('id',workspaceId).maybeSingle();
  if(workspaceError)return privateJson({error:'Could not verify workspace'},{status:503});
  if(!workspace)return privateJson({error:'Workspace not found or not permitted'},{status:404});

  const [knowledge,conversations,pending,leads,activeLeads]=await Promise.all([
    auth.db.from('knowledge').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id),
    auth.db.from('conversations').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id),
    auth.db.from('conversations').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id).eq('status','needs_human'),
    auth.db.from('leads').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id),
    auth.db.from('leads').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id).not('status','in','(won,lost)'),
  ]);
  const results=[knowledge,conversations,pending,leads,activeLeads];
  if(results.some(result=>result.error || result.count===null))
    return privateJson({error:'Workspace usage unavailable'},{status:503});
  return privateJson({
    workspaceId:workspace.id,
    scope:'all-time-record-counts',
    knowledgeTotal:knowledge.count,
    conversationTotal:conversations.count,
    needsHumanTotal:pending.count,
    leadTotal:leads.count,
    activeLeadTotal:activeLeads.count,
    billingMeter:false,
    usageLimitEnforced:false,
  });
}
