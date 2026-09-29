export type LeadStatus='new'|'qualified'|'contacted'|'won'|'lost';
export type LeadIntent='booking'|'pricing'|'purchase'|'service';
export type LeadSignal={
  shouldCapture:boolean;
  score:number;
  status:'new'|'qualified';
  intent:LeadIntent|null;
  summary:string;
  contactEmail:string|null;
  contactPhone:string|null;
  reasons:string[];
};

const INTENTS:{intent:LeadIntent;pattern:RegExp;label:string}[]=[
  {intent:'booking',pattern:/\b(book|booking|appointment|schedule|availability|available slot|reserve)\b/i,label:'booking intent'},
  {intent:'pricing',pattern:/\b(quote|estimate|pricing|price|cost|how much)\b/i,label:'pricing intent'},
  {intent:'purchase',pattern:/\b(buy|purchase|order|checkout|subscribe|sign up)\b/i,label:'purchase intent'},
  {intent:'service',pattern:/\b(hire|consultation|consult|interested in|work with|getting started|get started)\b/i,label:'service intent'},
];

function phoneFrom(text:string):string|null{
  const candidate=text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0]?.trim()||null;
  if(!candidate)return null;
  const digits=candidate.replace(/\D/g,'');
  return digits.length>=10&&digits.length<=15?candidate.slice(0,32):null;
}

export function classifyLead(message:string):LeadSignal{
  const text=message.trim();
  const contactEmail=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase()||null;
  const contactPhone=phoneFrom(text);
  const matched=INTENTS.find(item=>item.pattern.test(text))||null;
  const directAction=/\b(i|we)\s+(want|need|would like|am interested|are interested|ready|looking)\b/i.test(text);
  const reasons:string[]=[];
  let score=0;
  if(matched){score+=40;reasons.push(matched.label);}
  if(directAction){score+=15;reasons.push('explicit action language');}
  if(contactEmail){score+=25;reasons.push('email supplied');}
  if(contactPhone){score+=25;reasons.push('phone supplied');}
  score=Math.min(100,score);
  const shouldCapture=!!matched && score>=40;
  return {
    shouldCapture,
    score,
    status:score>=65?'qualified':'new',
    intent:matched?.intent||null,
    summary:matched ? matched.intent.charAt(0).toUpperCase()+matched.intent.slice(1)+' inquiry from website visitor' : '',
    contactEmail,
    contactPhone,
    reasons,
  };
}
