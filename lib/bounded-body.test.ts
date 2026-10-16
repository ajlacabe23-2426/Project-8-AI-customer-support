import { describe, expect, it } from 'vitest';
import { readBoundedBody } from './bounded-body';

const encoder = new TextEncoder();

function makeRequest(chunks: Uint8Array[], advertisedBytes?: string): Request {
  return new Request('https://widget.example.test/api/chat', {
    method: 'POST',
    headers: advertisedBytes === undefined ? {} : { 'content-length': advertisedBytes },
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
}

describe('anonymous widget streamed request-size enforcement', () => {
  it('accepts correctly sized split JSON without changing its contents', async () => {
    const result = await readBoundedBody(makeRequest([
      encoder.encode('{"message":"'),
      encoder.encode('hello"}'),
    ]), 5000);
    expect(result).toEqual({ kind: 'ok', text: '{"message":"hello"}' });
  });

  it('accepts a body exactly at its cap and rejects one byte beyond', async () => {
    expect(await readBoundedBody(makeRequest([encoder.encode('1234')]), 4))
      .toEqual({ kind: 'ok', text: '1234' });
    expect(await readBoundedBody(makeRequest([encoder.encode('1234'), encoder.encode('5')]), 4))
      .toEqual({ kind: 'too_large' });
  });

  it('rejects oversized streams even when Content-Length is missing or dishonest', async () => {
    const chunks = [encoder.encode('x'.repeat(140)), encoder.encode('y'.repeat(140))];
    expect(await readBoundedBody(makeRequest(chunks), 256)).toEqual({ kind: 'too_large' });
    expect(await readBoundedBody(makeRequest(chunks, '2'), 256)).toEqual({ kind: 'too_large' });
  });

  it('rejects an advertised oversize body without consuming its stream', async () => {
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) { pulls++; controller.enqueue(encoder.encode('a')); },
    }, { highWaterMark: 0 });
    const request = new Request('https://widget.example.test', {
      method: 'POST', headers: { 'content-length': '5001' }, body: stream, duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    expect(await readBoundedBody(request, 5000)).toEqual({ kind: 'too_large' });
    expect(pulls).toBe(0);
    await request.body?.cancel();
  });

  it('counts UTF-8 wire bytes rather than character count, including split codepoints', async () => {
    const bytes = encoder.encode('é');
    expect(await readBoundedBody(makeRequest([bytes.subarray(0, 1), bytes.subarray(1)]), 2))
      .toEqual({ kind: 'ok', text: 'é' });
    expect(await readBoundedBody(makeRequest([bytes]), 1)).toEqual({ kind: 'too_large' });
  });

  it('fails closed on malformed UTF-8 and stream read errors', async () => {
    expect(await readBoundedBody(makeRequest([new Uint8Array([0xc3, 0x28])]), 256))
      .toEqual({ kind: 'invalid' });
    const broken = new Request('https://widget.example.test', {
      method: 'POST', duplex: 'half',
      body: new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('network aborted')); } }),
    } as RequestInit & { duplex: 'half' });
    expect(await readBoundedBody(broken, 256)).toEqual({ kind: 'invalid' });
  });

  it('handles a bodyless request safely', async () => {
    expect(await readBoundedBody(new Request('https://widget.example.test'), 256))
      .toEqual({ kind: 'ok', text: '' });
  });
});
