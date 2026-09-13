export interface MediaWritable {
  write(chunk: Uint8Array): Promise<void> | void;
}

export interface ContentRange {
  end: number;
  total: number;
}

export function parseContentRange(value: string | null): ContentRange | null {
  const match = /^bytes\s+\d+-(\d+)\/(\d+)$/i.exec(value ?? '');
  if (!match) return null;

  return {
    end: Number(match[1]),
    total: Number(match[2]),
  };
}

export async function writeResponse(
  response: Response,
  writable: MediaWritable,
  onProgress: (loaded: number, total: number) => void,
  start = 0,
  total = Number(response.headers.get('Content-Length')) || 0,
): Promise<number> {
  const reader = response.body?.getReader();
  if (!reader) return start;

  let loaded = start;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    await writable.write(value);
    loaded += value.byteLength;
    onProgress(loaded, total);
  }

  return loaded;
}
