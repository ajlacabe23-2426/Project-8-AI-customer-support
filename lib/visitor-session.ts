import {createHash} from 'node:crypto';

// Public visitor UUIDs are anonymous, bearer-style session capabilities.
// Store only a one-way digest server-side so a database read does not reveal
// the browser-held capability itself.
export const VISITOR_SESSION_MS=24*60*60*1000;
export function visitorTokenHash(visitorToken:string):string {
  return createHash('sha256').update(visitorToken,'utf8').digest('hex');
}
export function visitorSessionExpired(createdAt:unknown,now=Date.now()):boolean {
  const timestamp=typeof createdAt==='string'?Date.parse(createdAt):NaN;
  // Invalid or implausible server dates fail closed.
  return !Number.isFinite(timestamp)||timestamp>now+60_000||timestamp<=now-VISITOR_SESSION_MS;
}
