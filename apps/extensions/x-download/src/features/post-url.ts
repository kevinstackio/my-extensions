const X_HOSTNAMES = new Set(['x.com', 'www.x.com']);
const POST_PATH = /^\/([^/]+)\/status\/(\d+)(?:\/(?:video|photo)\/\d+)?\/?$/;

export interface XPostTarget {
  postId: string;
  url: string;
}

export function parseXPostUrl(rawUrl: string | undefined): XPostTarget | null {
  if (!rawUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== 'https:') return null;

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!X_HOSTNAMES.has(hostname)) return null;

  const match = parsedUrl.pathname.match(POST_PATH);
  if (!match) return null;

  const account = match[1];
  const postId = match[2];
  if (!account || !postId) return null;

  return {
    postId,
    url: `https://x.com/${account}/status/${postId}`,
  };
}
