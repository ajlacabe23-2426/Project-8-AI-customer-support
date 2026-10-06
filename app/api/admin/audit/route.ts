import {NextRequest,NextResponse} from 'next/server';
import {authorizedDb} from '@/lib/supabase';
import {id} from '@/lib/validation';

export const runtime='nodejs';
const noStore={'Cache-Control':'no-store'};

export async function GET(req:NextRequest){
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)
    return NextResponse.json({error:'Invalid workspace'},{status:400,headers:noStore});

  const {data:workspace,error:workspaceError}=await auth.db.from('workspaces')
    .select('id').eq('id',workspaceId).maybeSingle();
  if(workspaceError||!workspace)
    return NextResponse.json({error:'Workspace not found or not permitted'},{status:404,headers:noStore});

  const {data,error}=await auth.db.from('audit_events')
    .select('id,event_type,subject_id,details,created_at')
    .eq('workspace_id',workspace.id)
    .order('created_at',{ascending:false})
    .limit(100);

  return NextResponse.json(
    error?{error:'Could not load audit history'}:{events:data??[]},
    {status:error?503:200,headers:noStore}
  );
}
