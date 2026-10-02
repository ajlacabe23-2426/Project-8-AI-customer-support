import {NextRequest,NextResponse} from 'next/server';
import {authorizedDb} from '@/lib/supabase';
import {id,leadStatusInput} from '@/lib/validation';

export const runtime='nodejs';

export async function GET(req:NextRequest){
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return NextResponse.json({error:'Invalid workspace'},{status:400});
  const {data,error}=await auth.db.from('leads')
    .select('id,status,score,intent,summary,reasons,contact_email,contact_phone,created_at,updated_at,conversation_id')
    .eq('workspace_id',workspaceId)
    .order('created_at',{ascending:false})
    .limit(100);
  return NextResponse.json(error?{error:'Could not load leads'}:{leads:data||[]},
    {status:error?503:200,headers:{'Cache-Control':'no-store'}});
}

export async function PATCH(req:NextRequest){
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const parsed=leadStatusInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid lead update'},{status:400});
  const {data,error}=await auth.db.from('leads')
    .update({status:parsed.data.status,updated_at:new Date().toISOString()})
    .eq('id',parsed.data.leadId)
    .select('id,status')
    .maybeSingle();
  return NextResponse.json(error||!data?{error:'Lead not found or not permitted'}:{lead:data},
    {status:error||!data?404:200,headers:{'Cache-Control':'no-store'}});
}
