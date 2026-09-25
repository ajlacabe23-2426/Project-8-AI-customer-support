// Public visitor UUIDs are anonymous, bearer-style session capabilities.
export const VISITOR_SESSION_MS=24*60*60*1000;
export function visitorSessionExpired(createdAt:unknown,now=Date.now()):boolean {
  const timestamp=typeof createdAt==='string'?Date.parse(createdAt):NaN;
  // Invalid or implausible server dates fail closed.
  return !Number.isFinite(timestamp)||timestamp>now+60_000||timestamp<=now-VISITOR_SESSION_MS;
}
