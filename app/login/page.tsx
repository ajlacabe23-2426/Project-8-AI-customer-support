'use client';
import { FormEvent,useState } from 'react';
import Link from 'next/link';
import { ArrowLeft,ArrowRight,Mail,ShieldCheck } from 'lucide-react';
import { browserDb } from '@/lib/supabase';
export default function Login(){
  const[email,setEmail]=useState('');
  const[busy,setBusy]=useState(false);
  const[notice,setNotice]=useState('');
  async function login(e:FormEvent){
    e.preventDefault();setBusy(true);setNotice('');
    try {
      const db=browserDb();
      const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/auth/callback'}});
      setNotice(error?error.message:'Check your email for a secure sign-in link. You may need to check spam.');
    }catch{setNotice('Sign-in is not configured yet. Connect a Supabase project first.');}
    finally{setBusy(false);}
  }
  return <main className="auth-shell"><div className="auth-left"><Link className="wordmark" href="/"><span className="mark">8<span>.</span></span> PROJECT EIGHT</Link><div><div className="eyebrow"><span className="live-dot"/> THE OPERATOR CONSOLE</div><h1>Support,<br/><em>under control.</em></h1><p>Manage your business knowledge, follow every conversation, and step in when your customers need a person.</p></div><div className="auth-foot"><ShieldCheck size={17}/> A separate workspace for every business.</div></div><div className="auth-right"><Link href="/" className="back-link"><ArrowLeft size={17}/> Back to platform</Link><form className="auth-form" onSubmit={login}><div className="auth-glyph"><Mail size={24}/></div><div className="section-label">SIGN IN / 001</div><h2>Enter your console.</h2><p>We&apos;ll send a secure sign-in link to your email. No password required.</p><label htmlFor="email">WORK EMAIL</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourbusiness.com"/><button className="btn btn-dark" disabled={busy}>{busy?'Sending...':'Send sign-in link'} <ArrowRight size={18}/></button>{notice&&<div className="form-notice" role="status">{notice}</div>}<small>By signing in, you acknowledge this is an early-stage beta. Do not upload sensitive customer data during testing.</small></form></div></main>;
}
