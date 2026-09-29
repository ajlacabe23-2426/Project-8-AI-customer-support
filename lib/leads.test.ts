import {describe,expect,it} from 'vitest';
import {classifyLead} from './leads';

describe('classifyLead',()=>{
  it('captures explicit pricing intent with contact details as qualified',()=>{
    const result=classifyLead('I need a quote for weekly service. Email me at alex@example.com or call (312) 555-0188.');
    expect(result.shouldCapture).toBe(true);
    expect(result.intent).toBe('pricing');
    expect(result.status).toBe('qualified');
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.contactEmail).toBe('alex@example.com');
    expect(result.contactPhone).toContain('312');
    expect(result.summary).toBe('Pricing inquiry from website visitor');
    expect(result.summary).not.toContain('alex@example.com');
  });

  it('captures a no-contact booking request as a new lead',()=>{
    const result=classifyLead('Can I book an appointment next week?');
    expect(result.shouldCapture).toBe(true);
    expect(result.intent).toBe('booking');
    expect(result.status).toBe('new');
  });

  it('does not turn ordinary support questions into leads',()=>{
    const result=classifyLead('What are your return hours on Saturday?');
    expect(result.shouldCapture).toBe(false);
    expect(result.intent).toBeNull();
  });
});
