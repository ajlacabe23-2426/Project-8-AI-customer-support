import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {createClient} from '@supabase/supabase-js';

// Every credential used by this suite comes from a freshly reset disposable loopback Supabase.
const {API_URL,ANON_KEY,SERVICE_ROLE_KEY}=process.env;
assert.equal(API_URL,'http://127.0.0.1:54321','Refuse non-loopback database');
assert.ok(ANON_KEY&&SERVICE_ROLE_KEY,'Missing local stack credentials');
const options={auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}};
const admin=createClient(API_URL,SERVICE_ROLE_KEY,options);
const guest=createClient(API_URL,ANON_KEY,options);
async function good(query,label){const result=await query;if(result.error)throw new Error(label+': '+result.error.code+' '+result.error.message);return result.data;}
async function account(label){
  const email='owner-'+label+'@project8-integration.invalid',password='Project8TestOnly_2026!';
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});
  assert.ifError(error);
  const client=createClient(API_URL,ANON_KEY,options);
  const signIn=await client.auth.signInWithPassword({email,password});
  assert.ifError(signIn.error);
  assert.equal(signIn.data.user.id,data.user.id);
  return {client,id:data.user.id};
}
const a=await account('a'),b=await account('b');
const wa=await good(a.client.from('workspaces').insert({owner_id:a.id,name:'Owner A',slug:'owner-a',allowed_origins:['http://127.0.0.1:3118']}).select().single(),'owner A workspace');
const wb=await good(b.client.from('workspaces').insert({owner_id:b.id,name:'Owner B',slug:'owner-b',allowed_origins:['http://127.0.0.1:3118']}).select().single(),'owner B workspace');
assert.notEqual(wa.id,wb.id);
assert.deepEqual((await good(a.client.from('workspaces').select('id'),'A workspace list')).map(x=>x.id),[wa.id]);
assert.deepEqual((await good(b.client.from('workspaces').select('id'),'B workspace list')).map(x=>x.id),[wb.id]);
const forged=await a.client.from('workspaces').insert({owner_id:b.id,name:'Forgery',slug:'forgery',allowed_origins:[]}).select();
assert.ok(forged.error,'Forged workspace ownership was accepted');
const noCrossWorkspace=await good(a.client.from('workspaces').update({name:'unauthorized'}).eq('id',wb.id).select('id'),'cross-owner workspace update');
assert.equal(noCrossWorkspace.length,0);
const ka=await good(a.client.from('knowledge').insert({workspace_id:wa.id,title:'Hours',body:'Business A opens on weekdays.'}).select().single(),'A knowledge');
const kb=await good(b.client.from('knowledge').insert({workspace_id:wb.id,title:'Hours',body:'Business B opens on weekends.'}).select().single(),'B knowledge');
assert.deepEqual((await good(a.client.from('knowledge').select('id'),'A knowledge list')).map(x=>x.id),[ka.id]);
assert.deepEqual((await good(b.client.from('knowledge').select('id'),'B knowledge list')).map(x=>x.id),[kb.id]);
assert.ok((await a.client.from('knowledge').insert({workspace_id:wb.id,title:'Cross',body:'A should not be allowed here.'})).error);
assert.equal((await good(a.client.from('knowledge').delete().eq('id',kb.id).select('id'),'cross-owner deletion')).length,0);
const token=crypto.randomUUID();
const conv=await good(admin.from('conversations').insert({workspace_id:wa.id,visitor_token:token}).select('id').single(),'service-created public conversation');
await good(admin.from('messages').insert({conversation_id:conv.id,role:'user',body:'General question'}),'service-created message');
assert.equal((await good(b.client.from('conversations').select('id').eq('id',conv.id),'other-owner conversation read')).length,0);
assert.equal((await good(b.client.from('messages').select('id').eq('conversation_id',conv.id),'other-owner message read')).length,0);
assert.equal((await good(guest.from('conversations').select('id'),'anonymous conversation read')).length,0);
assert.equal((await good(guest.from('messages').select('id'),'anonymous message read')).length,0);
assert.ok((await b.client.from('messages').insert({conversation_id:conv.id,role:'human',body:'Forged reply'})).error);
assert.ok((await guest.from('messages').insert({conversation_id:conv.id,role:'human',body:'Anon reply'})).error);
assert.ok((await a.client.from('messages').insert({conversation_id:conv.id,role:'assistant',body:'Forged model reply'})).error);
await good(a.client.from('messages').insert({conversation_id:conv.id,role:'human',body:'Authorized human reply'}),'owner human reply');
const count=await good(admin.rpc('claim_widget_rate_limit',{p_workspace:wa.id,p_key:'ci-workspace',p_bucket:new Date(Math.floor(Date.now()/60000)*60000).toISOString(),p_max:2}),'rate limit claim 1');
assert.equal(count,true);
const bucket=new Date(Math.floor(Date.now()/60000)*60000).toISOString();
assert.equal(await good(admin.rpc('claim_widget_rate_limit',{p_workspace:wa.id,p_key:'ci-workspace',p_bucket:bucket,p_max:2}),'rate limit claim 2'),true);
assert.equal(await good(admin.rpc('claim_widget_rate_limit',{p_workspace:wa.id,p_key:'ci-workspace',p_bucket:bucket,p_max:2}),'rate limit claim 3'),false);
console.log('PASS: two-owner workspace, knowledge, conversation, message RLS and rate limit assertions');

// Exercise the real Next.js widget boundary against the same disposable database.
const port=3118,base='http://127.0.0.1:'+port;
const server=spawn('npm',['run','start','--','-p',String(port),'-H','127.0.0.1'],{
  env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:API_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL:base,OPENAI_API_KEY:''},
  stdio:'ignore'
});
try{
  let ready=false;
  for(let i=0;i<60;i++){
    if(server.exitCode!==null)throw new Error('Next server quit during startup');
    try{const r=await fetch(base+'/');if(r.status<500){ready=true;break;}}catch{}
    await sleep(1000);
  }
  assert.ok(ready,'Local Next server did not become ready');
  const path='/api/history?widgetKey='+wa.public_key;
  const request=(origin,body,method='POST')=>fetch(base+path,{method,headers:{...(origin?{Origin:origin}:{}),'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{})});
  assert.equal((await request(null,{widgetKey:wa.public_key,visitorToken:token})).status,403,'Missing Origin accepted');
  assert.equal((await request('https://attacker.example',{widgetKey:wa.public_key,visitorToken:token})).status,403,'Cross-site Origin accepted');
  assert.equal((await request(base,{},'GET')).status,405,'Legacy query-string history endpoint remains accessible');
  const ok=await request(base,{widgetKey:wa.public_key,visitorToken:token});
  assert.equal(ok.status,200,'Allowed history request rejected');
  assert.equal(ok.headers.get('access-control-allow-origin'),base);
  assert.equal((await ok.json()).messages.length,2);
  const invalid=await request(base,{widgetKey:wa.public_key,visitorToken:'not-a-uuid'});
  assert.equal(invalid.status,400);
  const mismatch=await request(base,{widgetKey:wb.public_key,visitorToken:token});
  assert.equal(mismatch.status,400,'Widget key mismatch accepted');
  const isolated=await fetch(base+'/api/history?widgetKey='+wb.public_key,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({widgetKey:wb.public_key,visitorToken:token})});
  assert.equal(isolated.status,200);
  assert.deepEqual((await isolated.json()).messages,[],'Workspace B accessed A conversation by reusing A visitor token');
  const chat=await fetch(base+'/api/chat?widgetKey='+wa.public_key,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},
    body:JSON.stringify({widgetKey:wa.public_key,visitorToken:token,message:'Can someone help with the general business hours?'})});
  assert.equal(chat.status,200,'Customer chat route failed');
  assert.equal((await chat.json()).needsHuman,true,'Unconfigured model must route to a person');
  const updated=await request(base,{widgetKey:wa.public_key,visitorToken:token});
  assert.equal(updated.status,200);
  assert.equal((await updated.json()).messages.length,4,'Human fallback conversation was not persisted');
  const optionsRequest=await fetch(base+path,{method:'OPTIONS',headers:{Origin:base,'Access-Control-Request-Method':'POST'}});
  assert.equal(optionsRequest.status,204,'CORS preflight failed for approved origin');
  console.log('PASS: live local widget history/CORS, no token in URL, cross-origin denial and malformed-session rejection');
}finally{server.kill('SIGTERM');}
