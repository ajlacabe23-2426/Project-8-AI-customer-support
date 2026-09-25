import { NextRequest,NextResponse } from 'next/server';
import { authorizedDb } from '@/lib/supabase';
import { workspaceInput,id,normalizedOrigins } from '@/lib/validation';
import { z } from 'zod';
export const runtime='nodejs';
const noStore={'Cache-Control':'no-store'};
export async function GET() {
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data,error}=await auth.db.from('workspaces').select('id,name,slug,public_key,allowed_origins,created_at').order('created_at',{ascending:false});
  return NextResponse.json(error?{error:'Could not load workspaces'}:{workspaces:data||[]},{status:error?503:200,headers:noStore});
}
export async function POST(req:NextRequest) {
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const raw=await req.json().catch(()=>null), parsed=workspaceInput.safeParse(raw);
  if(!parsed.success)return NextResponse.json({error:'Invalid workspace or origins'},{status:400});
  const allowed=normalizedOrigins(parsed.data.allowedOrigins);
  if(!allowed)return NextResponse.json({error:'Use exact HTTPS origins (localhost may use HTTP)'},{status:400});
  const {data,error}=await auth.db.from('workspaces').insert({owner_id:auth.user.id,name:parsed.data.name,slug:parsed.data.slug,allowed_origins:allowed}).select('id,name,slug,public_key,allowed_origins').single();
  return NextResponse.json(error?{error:error.code==='23505'?'Slug already in use':'Could not create workspace'}:{workspace:data},{status:error?error.code==='23505'?409:503:201});
}
export async function PATCH(req:NextRequest) {
  const auth=await authorizedDb();
  if(!auth)return NextResponse.json({error:'Sign in required'},{status:401});
  const parsed=z.object({workspaceId:id,allowedOrigins:z.array(z.string().url().max(200)).min(1).max(10)}).strict().safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid origins'},{status:400});
  const origins=normalizedOrigins(parsed.data.allowedOrigins);
  if(!origins)return NextResponse.json({error:'Only exact HTTPS origins or local HTTP are accepted'},{status:400});
  const {data,error}=await auth.db.from('workspaces').update({allowed_origins:origins}).eq('id',parsed.data.workspaceId).select('id,allowed_origins').maybeSingle();
  return NextResponse.json(error||!data?{error:'Workspace not found or update failed'}:{workspace:data},{status:error||!data?404:200});
}
