import {describe,it,expect} from 'vitest';
import {visitorSessionExpired,visitorTokenHash,VISITOR_SESSION_MS} from './visitor-session';
describe('anonymous session lifetime',()=>{
  const now=Date.parse('2026-09-25T12:00:00.000Z');
  it('accepts only recent, valid server timestamps',()=>{
    expect(visitorSessionExpired(new Date(now-1000).toISOString(),now)).toBe(false);
    expect(visitorSessionExpired(new Date(now-VISITOR_SESSION_MS).toISOString(),now)).toBe(true);
    expect(visitorSessionExpired(new Date(now-VISITOR_SESSION_MS-1).toISOString(),now)).toBe(true);
    expect(visitorSessionExpired('unknown',now)).toBe(true);
    expect(visitorSessionExpired(new Date(now+60_001).toISOString(),now)).toBe(true);
  });
  it('hashes browser-held visitor capabilities before persistence',()=>{
    expect(visitorTokenHash('11111111-1111-4111-8111-111111111111'))
      .toBe('bd7662a5eeb41614e720d477abfcb2272e19a8a70a93b7e3bc8560d44ad326e9');
    expect(visitorTokenHash('11111111-1111-4111-8111-111111111111')).toHaveLength(64);
    expect(visitorTokenHash('11111111-1111-4111-8111-111111111111'))
      .not.toContain('11111111');
  });
});
