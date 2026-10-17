/**
 * Read a JSON request body with an enforced wire-byte ceiling.
 *
 * Content-Length is only an early rejection hint; streams can omit or forge it.
 * Neither endpoint may materialize an unbounded request with request.text().
 */
export type BoundedBody = { kind: 'ok'; text: string } | { kind: 'too_large' } | { kind: 'invalid' };

export async function readBoundedBody(request: Request, maxBytes: number): Promise<BoundedBody> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) throw new RangeError('Invalid body limit');

  const advertised = request.headers.get('content-length');
  if (advertised && /^\d+$/.test(advertised) && Number(advertised) > maxBytes) {
    return { kind: 'too_large' };
  }
  if (!request.body) return { kind: 'ok', text: '' };

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { kind: 'too_large' };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { kind: 'ok', text };
  } catch {
    await reader.cancel().catch(() => undefined);
    return { kind: 'invalid' };
  } finally {
    reader.releaseLock();
  }
}
