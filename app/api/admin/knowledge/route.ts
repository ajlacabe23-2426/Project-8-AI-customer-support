import { NextRequest, NextResponse } from 'next/server';
import { authorizedDb } from '@/lib/supabase';
import { knowledgeInput,id } from '@/lib/validation';
export const runtime='nodejs';
export async function GET(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const workspaceId=req.nextUrl.searchParams.get('workspaceId');
  if(!id.safeParse(workspaceId).success)return NextResponse.json({error:'Invalid workspace'},{status:400});
  const {data,error}=await auth.db.from('knowledge').select('id,title,body,created_at').eq('workspace_id',workspaceId).order('created_at',{ascending:false}).limit(100);
  return NextResponse.json(error?{error:'Could not load knowledge'}:{knowledge:data||[]},{status:error?503:200,headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const parsed=knowledgeInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid knowledge article'},{status:400});
  const {data,error}=await auth.db.from('knowledge').insert({workspace_id:parsed.data.workspaceId,title:parsed.data.title,body:parsed.data.body}).select('id,title,body,created_at').single();
  return NextResponse.json(error?{error:'Could not save article; check workspace access'}:{article:data},{status:error?403:201});
}
export async function DELETE(req:NextRequest) {
  const auth=await authorizedDb();if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const articleId=req.nextUrl.searchParams.get('id');
  if(!id.safeParse(articleId).success)return NextResponse.json({error:'Invalid article'},{status:400});
  const {data,error}=await auth.db.from('knowledge').delete().eq('id',articleId).select('id').maybeSingle();
  return NextResponse.json(error||!data?{error:'Not found or not permitted'}:{deleted:true},{status:error||!data?404:200});
}
