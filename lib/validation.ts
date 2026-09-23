import { z } from 'zod';

export const id = z.string().uuid();
export const incomingChat = z.object({
  widgetKey: id,
  visitorToken: id,
  message: z.string().trim().min(1).max(1500),
}).strict();
export const workspaceInput = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(48),
  allowedOrigins: z.array(z.string().url().max(200)).min(1).max(10),
}).strict();
export const knowledgeInput = z.object({
  workspaceId: id,
  title: z.string().trim().min(2).max(100),
  body: z.string().trim().min(10).max(4000),
}).strict();
export const replyInput = z.object({
  conversationId: id,
  body: z.string().trim().min(1).max(1500),
}).strict();
export function normalizeOrigin(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) return null;
    return url.origin;
  } catch { return null; }
}
export function allowedOrigin(origin: string | null, allowed: string[]): string | null {
  if (!origin) return null;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  return allowed.some(value => normalizeOrigin(value) === normalized) ? normalized : null;
}
export function normalizedOrigins(values: string[]): string[] | null {
  const normalized = values.map(normalizeOrigin);
  return normalized.every((origin): origin is string => !!origin)
    ? [...new Set(normalized)] : null;
}
