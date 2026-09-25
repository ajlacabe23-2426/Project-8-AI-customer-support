import { describe, it, expect } from 'vitest';
import { allowedOrigin, normalizeOrigin, incomingChat, historyRequest, normalizedOrigins } from './validation';
describe('widget origin and input boundaries', () => {
  it('requires exact origin matching rather than prefixes or subdomains', () => {
    expect(allowedOrigin('https://shop.example.com', ['https://shop.example.com'])).toBe('https://shop.example.com');
    expect(allowedOrigin('https://shop.example.com.attacker.net', ['https://shop.example.com'])).toBeNull();
    expect(allowedOrigin('https://evil.example.com', ['https://example.com'])).toBeNull();
    expect(allowedOrigin(null, ['https://shop.example.com'])).toBeNull();
  });
  it('rejects malformed origins and insecure public hosts', () => {
    expect(normalizeOrigin('https://example.com/path')).toBeNull();
    expect(normalizeOrigin('http://example.com')).toBeNull();
    expect(normalizeOrigin('https://user:pass@example.com')).toBeNull();
    expect(normalizeOrigin('http://localhost:3000')).toBe('http://localhost:3000');
    expect(normalizedOrigins(['https://shop.example.com','https://shop.example.com/'])).toEqual(['https://shop.example.com']);
  });
  it('requires ids, bounds message length and blocks unknown fields', () => {
    const valid={widgetKey:crypto.randomUUID(),visitorToken:crypto.randomUUID(),message:'Hello'};
    expect(incomingChat.safeParse(valid).success).toBe(true);
    expect(incomingChat.safeParse({...valid,message:'x'.repeat(1501)}).success).toBe(false);
    expect(incomingChat.safeParse({...valid,role:'system'}).success).toBe(false);
    expect(historyRequest.safeParse({widgetKey:valid.widgetKey,visitorToken:valid.visitorToken}).success).toBe(true);
    expect(historyRequest.safeParse({...valid}).success).toBe(false);
    expect(historyRequest.safeParse({widgetKey:valid.widgetKey,visitorToken:'forged'}).success).toBe(false);
  });
});
