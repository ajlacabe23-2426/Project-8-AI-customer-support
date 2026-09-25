import Link from 'next/link';
import { ArrowUpRight, Bot, CheckCircle2, Headphones, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
export default function Home(){
  return <main className="site">
    <header className="site-nav">
      <Link className="wordmark" href="/"><span className="mark">8<span>.</span></span> PROJECT EIGHT <span className="nav-caption">/ SUPPORT SYSTEMS</span></Link>
      <nav><a href="#platform">Platform</a><a href="#workflow">How it works</a><Link className="nav-action" href="/login">Open console <ArrowUpRight size={16}/></Link></nav>
    </header>
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow"><span className="live-dot"/> HUMAN-CENTERED AI SUPPORT <span className="index">001 — THE PLATFORM</span></div>
        <h1>Every answer,<br/><em>accountable.</em></h1>
        <p className="lead">Give customers quick answers from your own business knowledge. When the answer isn&apos;t clear, the assistant routes the conversation to your team—without pretending it solved the problem.</p>
        <div className="hero-buttons"><Link href="/login" className="btn btn-light">Launch your workspace <ArrowUpRight size={18}/></Link><a href="#workflow" className="btn btn-ghost">Explore the workflow <span>↘</span></a></div>
        <div className="hero-trust"><span><CheckCircle2 size={15}/> Workspace-isolated data</span><span><CheckCircle2 size={15}/> Human handoff</span><span><CheckCircle2 size={15}/> Website-ready widget</span></div>
      </div>
      <div className="hero-visual" aria-label="Illustrative chat product preview">
        <div className="visual-top"><span>PROJECT 08 / LIVE ASSISTANCE</span><span className="status"><span className="live-dot"/> PREVIEW</span></div>
        <div className="mock-chat">
          <div className="mock-header"><div className="mock-avatar"><Bot size={21}/></div><div><strong>Customer assistance</strong><small>Powered by your business knowledge</small></div><span className="mock-badge">ONLINE</span></div>
          <div className="mock-body"><small>ILLUSTRATIVE CONVERSATION</small><div className="bubble visitor">What is your return policy?</div><div className="bubble agent"><span className="source-dot"/> Our policy allows returns within 14 days with a receipt.<small>Source: Returns &amp; exchanges</small></div><div className="bubble visitor">Can you approve an exception?</div><div className="bubble agent">That needs a member of the team. I&apos;ve flagged this conversation for review.<small><Headphones size={13}/> HUMAN HANDOFF</small></div></div>
          <div className="mock-input"><span>Ask a question...</span><span>↗</span></div>
        </div>
        <div className="visual-bottom"><span>KNOWLEDGE FIRST.</span><span>PEOPLE WHEN IT MATTERS.</span></div>
      </div>
    </section>
    <section id="platform" className="section"><div className="section-label">01 / YOUR OPERATION</div><div className="section-intro"><h2>Built around the way<br/><em>your business works.</em></h2><p>One platform to organize your policies, respond to visitors, and take over when AI should not be making the call.</p></div>
      <div className="feature-grid">
        <article className="feature-card"><div className="feature-icon"><Sparkles size={23}/></div><span className="feature-number">01 — KNOWLEDGE</span><h3>Your facts, not guesswork.</h3><p>Provide your approved service details, operating hours and policies. When no relevant answer is available, the assistant requests human help.</p></article>
        <article className="feature-card"><div className="feature-icon"><MessageCircle size={23}/></div><span className="feature-number">02 — CONVERSATIONS</span><h3>One widget, any website.</h3><p>Add a lightweight support experience to an approved website. Visitors can send questions without creating an account.</p></article>
        <article className="feature-card"><div className="feature-icon"><Headphones size={23}/></div><span className="feature-number">03 — OVERSIGHT</span><h3>Keep humans in control.</h3><p>Review conversations that need attention in a protected inbox. Your response reaches the visitor when their widget session is open.</p></article>
        <article className="feature-card"><div className="feature-icon"><ShieldCheck size={23}/></div><span className="feature-number">04 — SECURITY</span><h3>Separate by design.</h3><p>Workspace-level access rules, strict website origin checks, bounded inputs and server-side provider credentials establish a secure starting point.</p></article>
      </div>
    </section>
    <section id="workflow" className="workflow"><div className="section-label">02 / THE FLOW</div><h2>From question <em>to resolution.</em></h2><div className="workflow-grid"><div><span>01</span><h3>Connect your site.</h3><p>Create a workspace, register your domain and install the widget snippet.</p></div><div><span>02</span><h3>Teach it your business.</h3><p>Add verified knowledge articles. The model uses relevant entries instead of making up policies.</p></div><div><span>03</span><h3>Own the handoff.</h3><p>Unanswered questions enter your inbox. Your team retains the decision.</p></div></div></section>
    <footer className="footer"><span>© PROJECT EIGHT · PRIVATE BETA FOUNDATION</span><span>BUILT FOR RESPONSIBLE SUPPORT <LockKeyhole size={14}/></span><Link href="/login">CONSOLE <ArrowUpRight size={15}/></Link></footer>
  </main>;
}
