'use strict';
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS acceptance runner loads isolated Playwright through NODE_PATH. */
// Real-browser acceptance. No production URLs, real customer email, or hosted data.
const assert=require('node:assert/strict');
const { chromium }=require('playwright');
const { spawn }=require('node:child_process');
const { randomUUID }=require('node:crypto');

const APP='http://127.0.0.1:3118';
const AUTH='http://127.0.0.1:54321';
const MAIL='http://127.0.0.1:54324';
const allowedOrigins=new Set([APP,AUTH]);
const timeout=15000;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function assertDisposable(){
  assert.equal(process.env.API_URL,AUTH,'Refusing non-loopback Supabase');
  assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,AUTH,'Refusing hosted Supabase');
  assert.ok(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,'Missing disposable public key');
  assert.ok(process.env.SUPABASE_SERVICE_ROLE_KEY,'Missing disposable service key');
  assert.equal(process.env.NEXT_PUBLIC_APP_URL,APP,'Refusing non-local app URL');
}

async function fetchLocal(url){
  const parsed=new URL(url);
  assert.ok([APP,AUTH,MAIL].includes(parsed.origin),'Refusing non-local HTTP request');
  const response=await fetch(parsed,{redirect:'manual',signal:AbortSignal.timeout(5000)});
  assert.equal(response.status,200,'Local email API unavailable');
  return response.json();
}

function extractConfirmationLink(message){
  const chunks=[
    message?.Text,message?.HTML,message?.body?.text,message?.body?.html,
    message?.text,message?.html
  ].filter(value=>typeof value==='string');
  const matches=chunks.join(' ').replace(/&amp;/g,'&').match(/https?:\/\/[^\s"'<>]+/g)||[];
  for(const match of matches){
    let candidate;
    try{candidate=new URL(match.replace(/[).,;]+$/,''));}catch{continue;}
    if(candidate.origin===AUTH && candidate.pathname==='/auth/v1/verify' &&
       candidate.searchParams.has('token') && candidate.searchParams.has('type'))return candidate.toString();
  }
  throw new Error('Local mailbox did not contain a loopback-only Supabase verification link (possible template mismatch)');
}

async function findEmail(mailbox){
  const deadline=Date.now()+timeout;
  const target=(mailbox+'@example.invalid').toLowerCase();
  while(Date.now()<deadline){
    // Supabase CLI's local mail service uses Mailpit, not legacy Inbucket.
    // Never query an external mailbox or print message bodies / one-time links.
    const result=await fetchLocal(MAIL+'/api/v1/messages?limit=50');
    assert.ok(Array.isArray(result.messages),'Unexpected local Mailpit schema');
    const matching=result.messages.find(item=>(item.To||[]).some(address=>
      String(address.Address||'').toLowerCase()===target));
    if(matching){
      assert.ok(matching.ID,'Mailpit message missing ID');
      return fetchLocal(MAIL+'/api/v1/message/'+encodeURIComponent(matching.ID));
    }
    await delay(350);
  }
  throw new Error('Local Mailpit did not receive the synthetic sign-in email');
}

async function signIn(browser,label){
  const context=await browser.newContext();
  const violations=[];
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(allowedOrigins.has(url.origin))return route.continue();
    // CSS requests remote Google Fonts. Deliberately block them while testing
    // system-font fallback; do not treat a blocked cosmetic font as auth leakage.
    if(['https://fonts.googleapis.com','https://fonts.gstatic.com'].includes(url.origin))
      return route.abort();
    // All other external requests are denied AND fail acceptance. Record only
    // the origin; never capture URL paths, tokens, fragments or query strings.
    violations.push(url.origin);
    return route.abort();
  });
  const page=await context.newPage();
  const mailbox='p8-accept-'+label+'-'+randomUUID().slice(0,12);
  const email=mailbox+'@example.invalid';
  await page.goto(APP+'/login',{waitUntil:'domcontentloaded'});
  await page.getByLabel('WORK EMAIL').fill(email);
  await page.getByRole('button',{name:/Send sign-in link/i}).click();
  await page.getByRole('status').getByText(/Check your email for a secure sign-in link/i).waitFor({timeout});
  const message=await findEmail(mailbox);
  const link=extractConfirmationLink(message);
  // Same context as initial request: PKCE cookie must survive for code exchange.
  try {
    await page.goto(link,{waitUntil:'domcontentloaded',timeout});
  }catch{
    // Playwright navigation errors can embed the one-time URL. Never log it.
    throw new Error('Could not complete local magic-link navigation (URL withheld)');
  }
  try{
    await page.waitForURL(url=>url.origin===APP && url.pathname==='/dashboard',{timeout});
    await page.locator('.console').waitFor({timeout});
  }catch{
    const current=new URL(page.url());
    // Do not print callback codes, email content or tokens.
    throw new Error('Magic-link acceptance failed: landed on '+current.origin+current.pathname+
      ' instead of an authenticated /dashboard. Inspect local template, redirect and PKCE cookie handling.');
  }
  assert.deepEqual(violations,[],'Browser attempted non-loopback traffic');
  return {page,context,email};
}

async function run(){
  assertDisposable();
  const server=spawn('npm',['run','start','--','-p','3118','-H','127.0.0.1'],{
    env:process.env,stdio:'ignore'
  });
  let browser;
  try{
    let ready=false;
    for(let i=0;i<70;i++){
      if(server.exitCode!==null)throw new Error('Disposable Next.js server exited early');
      try{const r=await fetch(APP+'/login');if(r.status===200){ready=true;break;}}catch{}
      await delay(500);
    }
    assert.ok(ready,'Next.js local acceptance server was not ready');
    browser=await chromium.launch({headless:true});
    const first=await signIn(browser,'a');
    await first.page.getByText('Create your', {exact:false}).first().waitFor({timeout});
    const inputs=first.page.locator('form.onboarding-form input');
    await inputs.nth(0).fill('Synthetic Acceptance A');
    await inputs.nth(1).fill('synthetic-accept-a');
    await inputs.nth(2).fill(APP);
    await first.page.getByRole('button',{name:/Create workspace/i}).click();
    await first.page.waitForFunction(() => [...document.querySelector('select.workspace-select').options].some(o=>o.textContent==='Synthetic Acceptance A'),{},{timeout});
    const firstResult=await first.page.request.get(APP+'/api/admin/workspace');
    assert.equal(firstResult.status(),200,'Authenticated account A workspace lookup failed');
    const firstWorkspaces=(await firstResult.json()).workspaces;
    assert.equal(firstWorkspaces.length,1);
    const firstId=firstWorkspaces[0].id;
    await first.page.reload({waitUntil:'domcontentloaded'});
    await first.page.waitForFunction(() => [...document.querySelector('select.workspace-select').options].some(o=>o.textContent==='Synthetic Acceptance A'),{},{timeout});
    const second=await signIn(browser,'b');
    const secondResult=await second.page.request.get(APP+'/api/admin/workspace');
    assert.equal(secondResult.status(),200,'Authenticated account B workspace lookup failed');
    assert.deepEqual((await secondResult.json()).workspaces,[],'Account B saw workspace A');
    const crossRead=await second.page.request.get(APP+'/api/admin/knowledge?workspaceId='+encodeURIComponent(firstId));
    assert.equal(crossRead.status(),200);
    assert.deepEqual((await crossRead.json()).knowledge,[],'Account B could read workspace A knowledge');
    const crossWrite=await second.page.request.post(APP+'/api/admin/knowledge',{data:{
      workspaceId:firstId,title:'Synthetic cross-owner attempt',body:'This must never appear in the owner workspace.'
    }});
    assert.notEqual(crossWrite.status(),201,'Account B inserted content into owner A workspace');
    await first.context.close();
    await second.context.close();
    console.log('PASS: real Chromium local magic-link, dashboard, refresh, two-owner isolation and denied cross-write');
  } finally {
    if(browser)await browser.close();
    if(server.exitCode===null){
      const exited=new Promise(resolve=>server.once('exit',resolve));
      server.kill('SIGTERM');
      const timer=setTimeout(()=>server.kill('SIGKILL'),4000);
      await exited;
      clearTimeout(timer);
    }
  }
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});
