'use client';
import { useCallback,useEffect,useMemo,useRef,useState,type FormEvent } from 'react';
import Link from 'next/link';
import { Activity,ArrowRight,BookOpen,CheckCircle2,Clipboard,ExternalLink,Headphones,LogOut,MessageCircle,Plus,RefreshCw,Settings,ShieldCheck,Target,Trash2 } from 'lucide-react';
import { browserDb } from '@/lib/browser-db';
type Workspace={id:string;name:string;slug:string;public_key:string;allowed_origins:string[];created_at:string};
type Article={id:string;title:string;body:string;created_at:string};
type Message={id:string;role:'user'|'assistant'|'human';body:string;created_at:string};
type Conversation={id:string;status:string;created_at:string;messages:Message[]};
type LeadStatus='new'|'qualified'|'contacted'|'won'|'lost';
type Lead={id:string;conversation_id:string;status:LeadStatus;score:number;intent:string;summary:string;reasons:string[];contact_email:string|null;contact_phone:string|null;created_at:string;updated_at:string};
type Tab='overview'|'knowledge'|'leads'|'inbox'|'settings';
async function api<T>(url:string, options?:RequestInit):Promise<T>{
  const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options?.body?{'Content-Type':'application/json'}:{}),...options?.headers}});
  const payload=await response.json();
  if(!response.ok)throw new Error(payload.error||'Request failed');
  return payload as T;
}
export default function Dashboard({email}:{email:string}){
  const[workspaces,setWorkspaces]=useState<Workspace[]>([]);
  const selectedIdRef=useRef('');
  const[selectedId,setSelectedId]=useState('');
  const[tab,setTab]=useState<Tab>('overview');
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState('');
  const[loaded,setLoaded]=useState(false);
  const[name,setName]=useState('');
  const[slug,setSlug]=useState('');
  const[domain,setDomain]=useState('');
  const[articles,setArticles]=useState<Article[]>([]);
  const[articleTitle,setArticleTitle]=useState('');
  const[articleBody,setArticleBody]=useState('');
  const[conversations,setConversations]=useState<Conversation[]>([]);
  const[leads,setLeads]=useState<Lead[]>([]);
  const[activeConversation,setActiveConversation]=useState('');
  const[reply,setReply]=useState('');
  const[origins,setOrigins]=useState('');
  const[copied,setCopied]=useState(false);
  const workspace=useMemo(()=>workspaces.find(w=>w.id===selectedId),[workspaces,selectedId]);
  const selectedConversation=conversations.find(c=>c.id===activeConversation);
  const needHuman=conversations.filter(c=>c.status==='needs_human').length;
  const activeLeads=leads.filter(lead=>lead.status!=='won'&&lead.status!=='lost').length;
  const qualifiedLeads=leads.filter(lead=>lead.status==='qualified').length;
  const loadWorkspaces=useCallback(async()=>{
    try{
      const result=await api<{workspaces:Workspace[]}>('/api/admin/workspace');
      setWorkspaces(result.workspaces);
      setSelectedId(previous=>result.workspaces.some(w=>w.id===previous)?previous:result.workspaces[0]?.id||'');
    }catch(e){setError(e instanceof Error?e.message:'Could not load workspaces');}
    finally{setLoaded(true);}
  },[]);
  const loadArticles=useCallback(async(id:string)=>{
    try {const result=await api<{knowledge:Article[]}>('/api/admin/knowledge?workspaceId='+encodeURIComponent(id));if(selectedIdRef.current===id)setArticles(result.knowledge);}
    catch(e){if(selectedIdRef.current===id)setError(e instanceof Error?e.message:'Could not load articles');}
  },[]);
  const loadConversations=useCallback(async(id:string)=>{
    try {const result=await api<{conversations:Conversation[]}>('/api/admin/conversations?workspaceId='+encodeURIComponent(id));if(selectedIdRef.current===id)setConversations(result.conversations);}
    catch(e){if(selectedIdRef.current===id)setError(e instanceof Error?e.message:'Could not load inbox');}
  },[]);
  const loadLeads=useCallback(async(id:string)=>{
    try {const result=await api<{leads:Lead[]}>('/api/admin/leads?workspaceId='+encodeURIComponent(id));if(selectedIdRef.current===id)setLeads(result.leads);}
    catch(e){if(selectedIdRef.current===id)setError(e instanceof Error?e.message:'Could not load leads');}
  },[]);
  useEffect(()=>{void loadWorkspaces();},[loadWorkspaces]);
  useEffect(()=>{selectedIdRef.current=selectedId;setArticles([]);setConversations([]);setLeads([]);setActiveConversation('');if(!selectedId)return;void loadArticles(selectedId);void loadConversations(selectedId);void loadLeads(selectedId);},[selectedId,loadArticles,loadConversations,loadLeads]);
  useEffect(()=>{setOrigins(workspace?.allowed_origins.join('\n')||'');},[workspace?.id,workspace?.allowed_origins]);
  async function createWorkspace(e:FormEvent){
    e.preventDefault();setError('');setBusy(true);
    try {
      const result=await api<{workspace:Workspace}>('/api/admin/workspace',{method:'POST',body:JSON.stringify({name,slug,allowedOrigins:[domain]})});
      await loadWorkspaces();setSelectedId(result.workspace.id);setTab('overview');
    }catch(e){setError(e instanceof Error?e.message:'Could not create workspace');}
    finally{setBusy(false);}
  }
  async function addArticle(e:FormEvent){
    e.preventDefault();if(!workspace)return;setBusy(true);setError('');
    try {await api('/api/admin/knowledge',{method:'POST',body:JSON.stringify({workspaceId:workspace.id,title:articleTitle,body:articleBody})});setArticleTitle('');setArticleBody('');await loadArticles(workspace.id);}
    catch(e){setError(e instanceof Error?e.message:'Could not save article');}
    finally{setBusy(false);}
  }
  async function deleteArticle(articleId:string){
    if(!workspace || !window.confirm('Delete this knowledge article?'))return;
    setBusy(true);setError('');
    try {await api('/api/admin/knowledge?id='+encodeURIComponent(articleId),{method:'DELETE'});await loadArticles(workspace.id);}
    catch(e){setError(e instanceof Error?e.message:'Could not delete article');}
    finally{setBusy(false);}
  }
  async function sendReply(e:FormEvent){
    e.preventDefault();if(!workspace||!selectedConversation)return;setBusy(true);setError('');
    try {await api('/api/admin/conversations',{method:'POST',body:JSON.stringify({conversationId:selectedConversation.id,body:reply})});setReply('');await loadConversations(workspace.id);}
    catch(e){setError(e instanceof Error?e.message:'Could not send reply');}
    finally{setBusy(false);}
  }
  async function deleteConversation(conversationId:string){
    if(!workspace || !window.confirm('Permanently delete this conversation and all its messages? This cannot be undone.'))return;
    setBusy(true);setError('');
    try{
      await api('/api/admin/conversations?conversationId='+encodeURIComponent(conversationId),{method:'DELETE'});
      setActiveConversation('');await loadConversations(workspace.id);
    }catch(e){setError(e instanceof Error?e.message:'Could not delete conversation');}
    finally{setBusy(false);}
  }
  async function updateLeadStatus(leadId:string,status:LeadStatus){
    if(!workspace)return;setBusy(true);setError('');
    try{await api('/api/admin/leads',{method:'PATCH',body:JSON.stringify({leadId,status})});await loadLeads(workspace.id);}
    catch(e){setError(e instanceof Error?e.message:'Could not update lead');}
    finally{setBusy(false);}
  }
  async function saveOrigins(e:FormEvent){
    e.preventDefault();if(!workspace)return;setBusy(true);setError('');
    try{await api('/api/admin/workspace',{method:'PATCH',body:JSON.stringify({workspaceId:workspace.id,allowedOrigins:origins.split('\n').map(o=>o.trim()).filter(Boolean)})});await loadWorkspaces();}
    catch(e){setError(e instanceof Error?e.message:'Could not update origins');}
    finally{setBusy(false);}
  }
  async function signOut(){await browserDb().auth.signOut();window.location.assign('/login');}
  const baseUrl=process.env.NEXT_PUBLIC_APP_URL || (typeof window!=='undefined'?window.location.origin:'https://YOUR-DEPLOYMENT');
  const snippet=workspace?'<script src="'+baseUrl+'/widget.js" data-project8-key="'+workspace.public_key+'" defer></script>':'';
  async function copySnippet(){try{await navigator.clipboard.writeText(snippet);setCopied(true);}catch{setError('Unable to copy; select the code manually.');}}
  const tabs:[Tab,string,typeof Activity][]=[['overview','Overview',Activity],['knowledge','Knowledge',BookOpen],['leads','Leads',Target],['inbox','Inbox',MessageCircle],['settings','Settings',Settings]];
  return <div className="console"><aside className="sidebar"><Link href="/" className="wordmark"><span className="mark">8<span>.</span></span><span>PROJECT EIGHT <small>OPERATOR CONSOLE</small></span></Link><div className="sidebar-section">WORKSPACE</div><select className="workspace-select" value={selectedId} onChange={e=>{selectedIdRef.current=e.target.value;setArticles([]);setConversations([]);setLeads([]);setSelectedId(e.target.value);setActiveConversation('');setTab('overview');}} aria-label="Workspace">{workspaces.length?workspaces.map(w=><option key={w.id} value={w.id}>{w.name}</option>):<option value="">No workspace</option>}</select><div className="sidebar-section">PLATFORM</div><nav className="side-nav">{tabs.map(([key,label,Icon])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)} disabled={!workspace}><Icon size={18}/>{label}{key==='leads'&&activeLeads>0&&<span className="nav-count">{activeLeads}</span>}{key==='inbox'&&needHuman>0&&<span className="nav-count">{needHuman}</span>}</button>)}</nav><div className="sidebar-spacer"/><div className="sidebar-bottom"><span><ShieldCheck size={16}/> WORKSPACE ISOLATED</span><div className="user-card"><span className="user-avatar">{email.charAt(0).toUpperCase()}</span><div><strong>{email}</strong><small>Owner</small></div><button aria-label="Sign out" onClick={signOut}><LogOut size={17}/></button></div></div></aside>
    <main className="console-main"><header className="console-header"><span>PROJECT 08 <span className="muted">/ {workspace?.name||'GETTING STARTED'} / {tab.toUpperCase()}</span></span><span className="header-right"><span className="live-dot"/> PLATFORM BETA <Link href="/" aria-label="View public site"><ExternalLink size={16}/></Link></span></header>
      {error&&<div className="alert" role="alert"><span>{error}</span><button onClick={()=>setError('')}>Dismiss</button></div>}
      {!loaded?<div className="console-content"><p>Loading your workspace...</p></div>:!workspace?<section className="console-content onboarding"><div className="eyebrow">WELCOME / INITIAL SETUP</div><h1>Create your <em>first workspace.</em></h1><p>Each business gets isolated knowledge, conversation history, lead recovery and approved website origins.</p><form className="panel onboarding-form" onSubmit={createWorkspace}><label>BUSINESS NAME<input required minLength={2} maxLength={80} value={name} onChange={e=>{setName(e.target.value);setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));}} placeholder="Acme Studio"/></label><label>UNIQUE WORKSPACE SLUG<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={48} value={slug} onChange={e=>setSlug(e.target.value)} placeholder="acme-studio"/></label><label>YOUR APPROVED WEBSITE ORIGIN<input required type="url" value={domain} onChange={e=>setDomain(e.target.value)} placeholder="https://yourbusiness.com"/><small>Enter only the website origin, without a path. For local testing, use http://localhost:3000.</small></label><button className="btn btn-dark" disabled={busy}>Create workspace <ArrowRight size={16}/></button></form></section>:
      <div className="console-content">
        <div className="page-title"><div><div className="eyebrow">WORKSPACE / {workspace.slug.toUpperCase()}</div><h1>{tab==='overview'?'Command center':tab==='knowledge'?'Business knowledge':tab==='leads'?'Lead recovery':tab==='inbox'?'Human inbox':'Workspace settings'}<span className="title-period">.</span></h1><p>{tab==='overview'?'Your AI front-desk operation at a glance.':tab==='knowledge'?'Only add information that your business has verified.':tab==='leads'?'Turn explicit buying intent into a visible follow-up queue.':tab==='inbox'?'Review escalations and respond as a person.':'Control where your widget can appear.'}</p></div><button className="refresh-btn" onClick={()=>{void loadWorkspaces();void loadArticles(workspace.id);void loadConversations(workspace.id);void loadLeads(workspace.id);}}><RefreshCw size={16}/> Refresh</button></div>
        {tab==='overview'&&<><div className="metric-grid"><div className="metric"><span>01 / KNOWLEDGE <BookOpen size={19}/></span><strong>{articles.length.toString().padStart(2,'0')}</strong><small>Approved sources</small></div><div className="metric"><span>02 / CONVERSATIONS <MessageCircle size={19}/></span><strong>{conversations.length.toString().padStart(2,'0')}</strong><small>Most recent 50</small></div><div className="metric important"><span>03 / ACTIVE LEADS <Target size={19}/></span><strong>{activeLeads.toString().padStart(2,'0')}</strong><small>{qualifiedLeads} qualified for follow-up</small></div><div className="metric"><span>04 / NEEDS YOUR TEAM <Headphones size={19}/></span><strong>{needHuman.toString().padStart(2,'0')}</strong><small>Conversations pending review</small></div></div><div className="panel panel-split"><div><div className="eyebrow">NEXT ACTION</div><h2>Turn support into<br/><em>lead recovery.</em></h2><p>Add approved knowledge, connect the widget, and let explicit pricing, booking, purchase and service intent surface in a follow-up queue.</p><button className="btn btn-dark" onClick={()=>setTab('knowledge')}>Add business knowledge <ArrowRight size={16}/></button></div><div className="setup-list"><div><span className="setup-number">01</span><div><strong>Create your workspace</strong><small>Business ownership and access boundaries</small></div><CheckCircle2 size={18}/></div><div><span className="setup-number">02</span><div><strong>Add approved knowledge</strong><small>{articles.length?articles.length+' article(s) ready':'No business articles yet'}</small></div>{articles.length>0&&<CheckCircle2 size={18}/>}</div><div><span className="setup-number">03</span><div><strong>Install your widget</strong><small>Copy the snippet in Settings</small></div></div><div><span className="setup-number">04</span><div><strong>Recover buying intent</strong><small>{activeLeads?activeLeads+' active lead(s) in your queue':'Pricing, booking and service intent will appear in Leads'}</small></div>{activeLeads>0&&<CheckCircle2 size={18}/>}</div></div></div></>}
        {tab==='knowledge'&&<div className="workspace-columns"><section className="panel"><div className="panel-heading"><span className="section-label">NEW SOURCE</span><h2>Add an article</h2><p>Answers are grounded in these articles. Keep each policy specific, correct and up to date.</p></div><form className="stack-form" onSubmit={addArticle}><label>ARTICLE TITLE<input required minLength={2} maxLength={100} value={articleTitle} onChange={e=>setArticleTitle(e.target.value)} placeholder="Returns and exchanges"/></label><label>VERIFIED CONTENT<textarea required minLength={10} maxLength={4000} rows={8} value={articleBody} onChange={e=>setArticleBody(e.target.value)} placeholder="Describe your policy, business hours, services, or escalation procedure..."/></label><button className="btn btn-dark" disabled={busy}>Save article <Plus size={17}/></button></form></section><section className="panel"><div className="panel-heading"><span className="section-label">APPROVED RECORDS / {articles.length}</span><h2>Knowledge library</h2></div>{!articles.length?<div className="empty-state"><BookOpen size={28}/><h3>No articles yet.</h3><p>Add a verified source to start answering customer questions.</p></div>:<div className="article-list">{articles.map(article=><article key={article.id}><div><h3>{article.title}</h3><p>{article.body}</p><small>{new Date(article.created_at).toLocaleDateString()}</small></div><button disabled={busy} aria-label={'Delete '+article.title} onClick={()=>void deleteArticle(article.id)}><Trash2 size={17}/></button></article>)}</div>}</section></div>}
        {tab==='leads'&&<div className="workspace-columns lead-columns"><section className="panel"><div className="panel-heading"><span className="section-label">RECOVERED OPPORTUNITIES / {leads.length}</span><h2>Lead queue</h2><p>Project 8 v1 uses transparent rules—not hidden AI judgment—to flag explicit booking, pricing, purchase or service intent.</p></div>{!leads.length?<div className="empty-state"><Target size={28}/><h3>No leads yet.</h3><p>Explicit buying intent from the website widget will appear here for human follow-up.</p></div>:<div className="lead-list">{leads.map(lead=><article key={lead.id}><div className="lead-top"><div><span className="section-label">{lead.intent.toUpperCase()} · SCORE {lead.score}</span><h3>{lead.summary}</h3></div><span className={lead.status==='qualified'?'pill attention':'pill'}>{lead.status.toUpperCase()}</span></div><div className="lead-contact"><span>{lead.contact_email||'No email supplied'}</span><span>{lead.contact_phone||'No phone supplied'}</span><small>{new Date(lead.created_at).toLocaleString()}</small></div><div className="lead-reasons">WHY FLAGGED: {(lead.reasons||[]).join(' · ')||'explicit commercial intent'}</div><label className="lead-status-label">FOLLOW-UP STATUS<select className="lead-status" value={lead.status} disabled={busy} onChange={e=>void updateLeadStatus(lead.id,e.target.value as LeadStatus)}><option value="new">New</option><option value="qualified">Qualified</option><option value="contacted">Contacted</option><option value="won">Won</option><option value="lost">Lost</option></select></label></article>)}</div>}</section><section className="panel"><div className="panel-heading"><span className="section-label">AUTOMATION / V1 BOUNDARY</span><h2>AI front desk, human close.</h2><p>The visitor still receives grounded support. Project 8 separately surfaces explicit commercial intent so the business can follow up instead of losing the opportunity.</p></div><div className="setup-list"><div><span className="setup-number">01</span><div><strong>Detect intent</strong><small>Booking, quote, purchase and service language</small></div><CheckCircle2 size={18}/></div><div><span className="setup-number">02</span><div><strong>Capture volunteered contact</strong><small>Email or phone only when the visitor supplied it</small></div><CheckCircle2 size={18}/></div><div><span className="setup-number">03</span><div><strong>Prioritize transparently</strong><small>Rule-based score and visible status—not a black-box sales decision</small></div><CheckCircle2 size={18}/></div><div><span className="setup-number">04</span><div><strong>Follow up as a human</strong><small>CRM, scheduling, SMS and email execution remain future controlled integrations</small></div></div></div></section></div>}
        {tab==='inbox'&&<div className="workspace-columns inbox-columns"><section className="panel inbox-list"><div className="panel-heading"><span className="section-label">RECENT CONVERSATIONS / {conversations.length}</span><h2>Support queue</h2></div>{!conversations.length?<div className="empty-state"><MessageCircle size={28}/><h3>No conversations yet.</h3><p>New website conversations will appear here.</p></div>:conversations.map(c=><button className={'inbox-item '+(activeConversation===c.id?'selected':'')} key={c.id} onClick={()=>setActiveConversation(c.id)}><div><strong>{c.messages.filter(m=>m.role==='user').at(-1)?.body||'Customer conversation'}</strong><small>{new Date(c.created_at).toLocaleString()}</small></div><span className={c.status==='needs_human'?'pill attention':'pill'}>{c.status==='needs_human'?'NEEDS HUMAN':c.status.toUpperCase()}</span></button>)}</section><section className="panel thread-panel">{selectedConversation?<><div className="panel-heading"><span className="section-label">CONVERSATION / {selectedConversation.id.slice(0,8)}</span><h2>Conversation detail</h2><button className="btn btn-outline" type="button" disabled={busy} onClick={()=>void deleteConversation(selectedConversation.id)}>Delete conversation &amp; messages</button><span className={selectedConversation.status==='needs_human'?'pill attention':'pill'}>{selectedConversation.status.replace('_',' ').toUpperCase()}</span></div><div className="thread-messages">{[...selectedConversation.messages].sort((a,b)=>a.created_at.localeCompare(b.created_at)).map(m=><div className={'thread-message '+m.role} key={m.id}><small>{m.role==='user'?'VISITOR':m.role==='human'?'YOUR TEAM':'AI ASSISTANT'} · {new Date(m.created_at).toLocaleTimeString()}</small><p>{m.body}</p></div>)}</div><form className="reply-form" onSubmit={sendReply}><label htmlFor="human-reply">SEND A HUMAN REPLY</label><textarea id="human-reply" required maxLength={1500} rows={3} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a response to this visitor..."/><small>Your reply appears in the visitor&apos;s widget while their session remains open. This does not send an email.</small><button className="btn btn-dark" disabled={busy}>Send reply <ArrowRight size={16}/></button></form></>:<div className="empty-state"><Headphones size={28}/><h3>Choose a conversation.</h3><p>Open a thread on the left to review messages and reply.</p></div>}</section></div>}
        {tab==='settings'&&<div className="workspace-columns"><section className="panel"><div className="panel-heading"><span className="section-label">SECURITY / DOMAIN ACCESS</span><h2>Approved websites</h2><p>Only these exact origins may call your public support API from a browser. Include https:// and add www separately if needed.</p></div><form className="stack-form" onSubmit={saveOrigins}><label>ALLOWED ORIGINS — ONE PER LINE<textarea required rows={5} value={origins} onChange={e=>setOrigins(e.target.value)} placeholder="https://example.com&#10;https://www.example.com"/></label><button className="btn btn-dark" disabled={busy}>Save origins <ShieldCheck size={17}/></button></form></section><section className="panel"><div className="panel-heading"><span className="section-label">INTEGRATION / WEBSITE WIDGET</span><h2>Install your assistant</h2><p>Add this snippet just before your website&apos;s closing body tag. The widget uses your public workspace key, not a secret.</p></div><pre className="snippet"><code>{snippet}</code></pre><button className="btn btn-outline" onClick={()=>void copySnippet()}><Clipboard size={16}/>{copied?'Copied':'Copy snippet'}</button><div className="callout"><Activity size={18}/><p>For testing on this deployment, add its exact origin to your approved websites. AI responses also require server-side provider credentials.</p></div></section></div>}
      </div>}
    </main></div>;
}
