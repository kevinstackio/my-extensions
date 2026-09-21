import { parseXPostUrl } from '../post-url';
import { extractMediaSources } from './extract';
import type { MediaSource } from './model';

export interface MediaCaptureEvent {
  source: 'x-download-page-media';
  type: 'media-source.captured';
  postId: string;
  mediaSources: MediaSource[];
}

type CaptureEmitter = (event: MediaCaptureEvent) => void;
type PostIDReader = () => string | undefined;

export function wrapFetch(
  originalFetch: typeof fetch,
  getCurrentPostId: PostIDReader,
  emit: CaptureEmitter,
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    const url = requestURL(input);
    if (url && isCandidateAPIURL(url)) {
      observeResponseClone(response.clone(), getCurrentPostId, emit);
    }
    return response;
  }) as typeof fetch;
}

export function observeXHRPayload(
  url: string,
  responseType: XMLHttpRequestResponseType,
  body: unknown,
  postId: string | undefined,
  emit: CaptureEmitter,
): void {
  if (!isCandidateAPIURL(url) || !postId || !['', 'text', 'json'].includes(responseType)) return;
  const payload = typeof body === 'string' ? parseJSON(body) : body;
  if (payload === undefined) return;
  emitSources(payload, postId, emit);
}

export function readXHRBody(
  responseType: XMLHttpRequestResponseType,
  response: unknown,
  readText: () => unknown,
): unknown {
  if (responseType === 'json') return response;
  if (responseType === '' || responseType === 'text') return readText();
  return undefined;
}

export function installPageMediaObserver(scope: Window): void {
  const getCurrentPostId = () => parseXPostUrl(scope.location.href)?.postId;
  const emit = (event: MediaCaptureEvent) => scope.postMessage(event, '*');
  const marker = Symbol.for('x-download-page-media-observer-installed');
  const markedScope = scope as Window & { [marker]?: boolean };
  if (markedScope[marker]) return;
  markedScope[marker] = true;

  // 只观察 X 的接口地址并读取 clone，原始 Response 仍原样返回给 X 页面，降低页面回归风险。
  const originalFetch = scope.fetch.bind(scope);
  scope.fetch = wrapFetch(originalFetch, getCurrentPostId, emit);
  installXHRObserver(scope, getCurrentPostId, emit);
}

function installXHRObserver(scope: Window, getCurrentPostId: PostIDReader, emit: CaptureEmitter): void {
  const constructor = (scope as Window & { XMLHttpRequest?: typeof XMLHttpRequest }).XMLHttpRequest;
  if (!constructor) return;

  const requestURLs = new WeakMap<XMLHttpRequest, string>();
  const prototype = constructor.prototype;
  const originalOpen = prototype.open as unknown as (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) => void;
  const originalSend = prototype.send as unknown as (
    this: XMLHttpRequest,
    body?: Document | XMLHttpRequestBodyInit | null,
  ) => void;

  prototype.open = function (method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
    requestURLs.set(this, String(url));
    return originalOpen.call(this, method, url, async, username, password);
  };
  prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    this.addEventListener('load', () => {
      const url = requestURLs.get(this);
      if (!url) return;
      try {
        const responseBody = readXHRBody(this.responseType, this.response, () => this.responseText);
        if (responseBody === undefined) return;
        observeXHRPayload(url, this.responseType, responseBody, getCurrentPostId(), emit);
      } catch {
        return;
      }
    }, { once: true });
    return originalSend.call(this, body);
  };
}

function observeResponseClone(response: Response, getCurrentPostId: PostIDReader, emit: CaptureEmitter): void {
  void response.json()
    .then(payload => {
      const postId = getCurrentPostId();
      if (postId) emitSources(payload, postId, emit);
    })
    .catch(() => undefined);
}

function emitSources(payload: unknown, postId: string, emit: CaptureEmitter): void {
  const mediaSources = extractMediaSources(payload, postId);
  if (mediaSources.length === 0) return;
  emit({ source: 'x-download-page-media', type: 'media-source.captured', postId, mediaSources });
}

function requestURL(input: RequestInfo | URL): string | undefined {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function isCandidateAPIURL(value: string): boolean {
  try {
    const url = new URL(value, globalThis.location?.href);
    return (url.hostname === 'x.com' || url.hostname === 'www.x.com')
      && (url.pathname.startsWith('/i/api/') || url.pathname.includes('/graphql/'));
  } catch {
    return false;
  }
}

function parseJSON(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
