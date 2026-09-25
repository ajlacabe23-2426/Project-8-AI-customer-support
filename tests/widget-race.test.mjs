import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// A tiny DOM and controlled network let us test the actual shipped widget
// without adding a browser-only test dependency or contacting a hosted service.
class Element {
  constructor(tag){this.tag=tag;this.className='';this.children=[];this.attributes=new Map();this.events=new Map();
    this.textContent='';this.value='';this.hidden=false;this.disabled=false;}
  append(...items){this.children.push(...items);}
  appendChild(item){this.children.push(item);return item;}
  replaceChildren(...items){this.children=[...items];}
  setAttribute(name,value){this.attributes.set(name,String(value));}
  getAttribute(name){return this.attributes.get(name)||null;}
  addEventListener(name,handler){this.events.set(name,handler);}
  emit(name){return this.events.get(name)?.({preventDefault(){}});}
  attachShadow(){this.shadow=new Element('shadow');return this.shadow;}
  focus(){}
}
const key='11111111-1111-4111-8111-111111111111';
const response=(status,data={})=>({status,ok:status>=200&&status<300,json:async()=>data});
const tick=async()=>{await new Promise(resolve=>setImmediate(resolve));};
function makeWidget(){
  const requests=[],storage=new Map(),body=new Element('body');
  let interval=null,uid=0;
  const document={
    currentScript:{src:'https://support.example/widget.js',getAttribute:name=>name==='data-project8-key'?key:null},
    body,createElement:tag=>new Element(tag)
  };
  const sandbox={
    document,URL,
    crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(++uid).padStart(12,'0')}`},
    sessionStorage:{getItem:name=>storage.get(name)||null,setItem:(name,value)=>storage.set(name,value)},
    fetch:(url,options)=>new Promise((resolve,reject)=>requests.push({url,options,resolve,reject})),
    setInterval:handler=>{interval=handler;return 1;},
    clearInterval:()=>{interval=null;}
  };
  runInNewContext(readFileSync(new URL('../public/widget.js',import.meta.url),'utf8'),sandbox);
  const root=body.children[0].shadow;
  const find=(node,cls)=>{
    if(node.className===cls)return node;
    for(const child of node.children){const match=find(child,cls);if(match)return match;}
    return null;
  };
  const trigger=find(root,'trigger'),form=find(root,'form'),input=find(root,'input'),feed=find(root,'feed'),status=find(root,'');
  const visibleText=()=>feed.children.map(child=>child.textContent).join('|');
  return {requests,storage,trigger,form,input,feed,visibleText,interval:()=>interval,
    token:()=>storage.get('p8-visitor-'+key)};
}
describe('visitor widget async session isolation',()=>{
  it('ignores an older history response after a newer history has rendered',async()=>{
    const widget=makeWidget();
    widget.trigger.emit('click');
    expect(widget.requests).toHaveLength(1);
    widget.interval()();
    expect(widget.requests).toHaveLength(2);
    widget.requests[1].resolve(response(200,{status:'open',
      messages:[{id:'new',role:'human',body:'Newer reply'}]}));
    await tick();
    widget.requests[0].resolve(response(200,{status:'open',
      messages:[{id:'old',role:'human',body:'Stale reply'}]}));
    await tick();
    expect(widget.visibleText()).toBe('Newer reply');
  });
  it('rotates only once and ignores an old history response after expiration',async()=>{
    const widget=makeWidget(),original=widget.token();
    widget.trigger.emit('click');
    widget.interval()();
    widget.requests[1].resolve(response(410));
    await tick();
    const renewed=widget.token();
    expect(renewed).not.toBe(original);
    widget.requests[0].resolve(response(410));
    await tick();
    expect(widget.token()).toBe(renewed);
    expect(widget.visibleText()).toBe('');
    widget.interval()();
    expect(JSON.parse(widget.requests[2].options.body).visitorToken).toBe(renewed);
    widget.requests[2].resolve(response(200,{status:'open',messages:[{id:'fresh',role:'human',body:'Fresh conversation'}]}));
    await tick();
    expect(widget.visibleText()).toBe('Fresh conversation');
  });
  it('preserves a pending question on expiry and never renders the old chat or history in the new session',async()=>{
    const widget=makeWidget(),original=widget.token();
    widget.trigger.emit('click'); // old history request stays pending
    widget.input.value='Can you help with business hours?';
    widget.form.emit('submit');
    expect(widget.requests).toHaveLength(2);
    expect(JSON.parse(widget.requests[1].options.body).visitorToken).toBe(original);
    widget.requests[1].resolve(response(410));
    await tick();
    const renewed=widget.token();
    expect(renewed).not.toBe(original);
    expect(widget.input.value).toBe('Can you help with business hours?');
    expect(widget.visibleText()).toBe('');
    widget.form.emit('submit');
    expect(JSON.parse(widget.requests[2].options.body).visitorToken).toBe(renewed);
    widget.requests[2].resolve(response(200,{answer:'Please visit our hours page.',needsHuman:false}));
    await tick();
    expect(widget.requests).toHaveLength(4); // fresh history after successful send
    widget.requests[3].resolve(response(200,{status:'open',messages:[
      {id:'current-user',role:'user',body:'Can you help with business hours?'},
      {id:'current-agent',role:'assistant',body:'Please visit our hours page.'}
    ]}));
    await tick();
    widget.requests[0].resolve(response(200,{status:'open',
      messages:[{id:'old-private',role:'human',body:'Old session reply must not appear'}]}));
    await tick();
    expect(widget.token()).toBe(renewed);
    expect(widget.visibleText()).toContain('Please visit our hours page.');
    expect(widget.visibleText()).not.toContain('Old session reply must not appear');
  });
});
