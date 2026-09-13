import { describe, expect, it } from 'vitest';

import { parseContentRange, writeResponse } from '../src/features/download/range';

describe('媒体响应范围', () => {
  it('解析后续 Range 请求需要的总字节数', () => {
    expect(parseContentRange('bytes 0-9/20')).toEqual({ end: 9, total: 20 });
    expect(parseContentRange('invalid')).toBeNull();
  });

  it('响应数据按读取块直接写入文件', async () => {
    const writes: number[][] = [];
    const progress: Array<[number, number]> = [];
    const chunks = [new Uint8Array([1, 2]), new Uint8Array([3])];
    const response = new Response(new ReadableStream({
      pull(controller) {
        const chunk = chunks.shift();
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
    }), {
      headers: { 'Content-Length': '3' },
    });

    const loaded = await writeResponse(
      response,
      { write: async chunk => { writes.push([...chunk]); } },
      (current, total) => { progress.push([current, total]); },
    );

    expect(writes).toEqual([[1, 2], [3]]);
    expect(progress).toEqual([[2, 3], [3, 3]]);
    expect(loaded).toBe(3);
  });
});
