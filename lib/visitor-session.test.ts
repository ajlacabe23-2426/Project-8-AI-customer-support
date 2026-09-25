import {describe,it,expect} from 'vitest';
import {visitorSessionExpired,VISITOR_SESSION_MS} from './visitor-session';
describe('anonymous session lifetime',()=>{
  const now=Date.parse('2026-09-25T12:00:00.000Z');
  it('accepts only recent, valid server timestamps',()=>{
    expect(visitorSessionExpired(new Date(now-1000).toISOString(),now)).toBe(false);
    expect(visitorSessionExpired(new Date(now-VISITOR_SESSION_MS).toISOString(),now)).toBe(true);
    expect(visitorSessionExpired(new Date(now-VISITOR_SESSION_MS-1).toISOString(),now)).toBe(true);
    expect(visitorSessionExpired('unknown',now)).toBe(true);
    expect(visitorSessionExpired(new Date(now+60_001).toISOString(),now)).toBe(true);
  });
});
