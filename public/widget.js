/* Project 8: Visitor token is a session capability, not customer authentication. */
(function () {
  'use strict';
  var script=document.currentScript;
  var key=script && script.getAttribute('data-project8-key');
  if (!key || !/^[0-9a-f-]{36}$/i.test(key)) return;
  var api;
  try { api=new URL(script.src).origin; } catch { return; }
  var storageKey='p8-visitor-'+key;
  var token;
  try { token=sessionStorage.getItem(storageKey); if(!token || !/^[0-9a-f-]{36}$/i.test(token)){token=crypto.randomUUID();sessionStorage.setItem(storageKey,token);} }
  catch { token=crypto.randomUUID(); }
  var feed,form,input,send,status,open=false,busy=false,lastSignature='',interval=null;
  function element(tag,cls,content) {
    var item=document.createElement(tag);if(cls)item.className=cls;if(content!==undefined)item.textContent=content;return item;
  }
  function bubble(role,body) {
    var item=element('div','msg '+(role==='user'?'user':'agent'),body);
    feed.appendChild(item);feed.scrollTop=feed.scrollHeight;
  }
  async function history(){
    try{
      var url=api+'/api/history?widgetKey='+encodeURIComponent(key);
      var response=await fetch(url,{method:'POST',mode:'cors',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({widgetKey:key,visitorToken:token})});
      if(!response.ok)return;
      var data=await response.json();
      var messages=Array.isArray(data.messages)?data.messages:[];
      var signature=messages.map(function(m){return m.id;}).join(',');
      if(signature!==lastSignature){
        feed.replaceChildren();
        messages.forEach(function(m){if(typeof m.body==='string')bubble(m.role,m.body);});
        lastSignature=signature;
      }
      status.textContent=data.status==='needs_human'?'Waiting for your support team':'Business support';
    }catch {status.textContent='Support connection unavailable';}
  }
  function toggle(){
    open=!open;panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
    if(open){input.focus();void history();interval=setInterval(history,6000);}
    else if(interval){clearInterval(interval);interval=null;}
  }
  var trigger=element('button','trigger','Need help?  ↗');trigger.type='button';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','Open customer support');
  var panel=element('section','panel');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Customer support chat');
  var head=element('header','head');var headings=element('div');headings.appendChild(element('strong','', 'How can we help?'));status=element('small','', 'Business support');headings.appendChild(status);
  var close=element('button','close','×');close.type='button';close.setAttribute('aria-label','Close customer support');
  head.append(headings,close);feed=element('div','feed');feed.setAttribute('aria-live','polite');
  var intro=element('p','intro','Ask a question. A member of the business team can step in when needed.');feed.appendChild(intro);
  form=element('form','form');input=element('input','input');input.type='text';input.maxLength=1500;input.required=true;input.placeholder='Type your question...';input.setAttribute('aria-label','Your question');
  send=element('button','send','Send');send.type='submit';form.append(input,send);panel.append(head,feed,form);
  var style=document.createElement('style');style.textContent=
    ':host{all:initial;position:fixed;z-index:2147483000;right:20px;bottom:20px;font:14px/1.5 system-ui,Arial,sans-serif;color:#1e3023}'+
    '*{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer}.trigger{background:#1c2b22;color:#f4f9ed;padding:13px 18px;border:0;border-radius:30px;box-shadow:0 6px 24px #0002;font-weight:700}'+
    '.panel{width:min(370px,calc(100vw - 30px));height:min(540px,calc(100dvh - 105px));background:#fff;box-shadow:0 10px 50px #0003;border-radius:12px;margin-bottom:12px;display:flex;flex-direction:column;overflow:hidden;border:1px solid #d9e4d2}.panel[hidden]{display:none}'+
    '.head{padding:17px;background:#1c2b22;color:white;display:flex;justify-content:space-between;align-items:center}.head strong,.head small{display:block}.head small{font-size:11px;color:#bbd3b2}.close{border:0;background:none;color:white;font-size:25px}'+
    '.feed{flex:1;overflow:auto;padding:15px;background:#f5f7f2;display:flex;flex-direction:column;gap:10px}.intro{color:#6c7c69;font-size:12px}.msg{padding:10px 12px;border-radius:10px;max-width:90%;white-space:pre-wrap;overflow-wrap:anywhere}.msg.user{align-self:flex-end;background:#dcecd4}.msg.agent{align-self:flex-start;background:white;border:1px solid #e0e9dc}'+
    '.form{display:flex;gap:7px;padding:12px;border-top:1px solid #e2e9df}.input{flex:1;min-width:0;padding:10px;border:1px solid #d5e0d0;border-radius:7px}.send{border:0;color:#fff;background:#1c2b22;border-radius:7px;padding:10px}.send:disabled{opacity:.5}'+
    '@media(max-width:420px){:host{bottom:10px;right:10px}.panel{width:calc(100vw - 20px)}}';
  var root=element('div');var shadow=root.attachShadow({mode:'open'});shadow.append(style,panel,trigger);document.body.appendChild(root);
  trigger.addEventListener('click',toggle);close.addEventListener('click',toggle);
  form.addEventListener('submit',async function(e){
    e.preventDefault();if(busy || !input.value.trim())return;
    var message=input.value.trim();busy=true;send.disabled=true;input.value='';bubble('user',message);
    try {
      var response=await fetch(api+'/api/chat?widgetKey='+encodeURIComponent(key),{
        method:'POST',mode:'cors',cache:'no-store',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({widgetKey:key,visitorToken:token,message:message})
      });
      var data=await response.json();
      if(!response.ok)throw new Error(data.error||'Support unavailable');
      bubble('assistant',data.answer||'Your message was received.');
      status.textContent=data.needsHuman?'Waiting for your support team':'Business support';
      await history();
    } catch(err){bubble('assistant',err instanceof Error?err.message:'Support temporarily unavailable');}
    finally {busy=false;send.disabled=false;input.focus();}
  });
}());
