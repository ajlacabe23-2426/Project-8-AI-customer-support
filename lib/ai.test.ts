import {it,expect,describe} from 'vitest';
import {relevantKnowledge, draftAnswer} from './ai';
const docs=[{id:'one',title:'Refund policy',body:'Refunds are available within 14 days.'},{id:'two',title:'Store hours',body:'We open on Monday.'}];
describe('grounded support',()=>{
  it('selects related records and excludes unrelated records',()=>{
    expect(relevantKnowledge('What is the refund policy?',docs).map(d=>d.id)).toEqual(['one']);
    expect(relevantKnowledge('How do I land a spaceship?',docs)).toEqual([]);
  });
  it('routes unanswered questions to a human without a configured model',async()=>{
    const old=process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {expect((await draftAnswer('unknown question',docs,[])).needsHuman).toBe(true);}
    finally {if(old)process.env.OPENAI_API_KEY=old;}
  });
});
