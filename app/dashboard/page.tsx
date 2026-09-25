import { redirect } from 'next/navigation';
import { authorizedDb } from '@/lib/supabase';
import Dashboard from './workspace';
export const dynamic='force-dynamic';
export default async function DashboardPage(){
  const auth=await authorizedDb();
  if(!auth)redirect('/login');
  return <Dashboard email={auth.user.email||'Operator'}/>;
}
