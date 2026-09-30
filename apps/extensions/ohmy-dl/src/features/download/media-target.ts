const viewerSelector = [
  '#MediaViewer',
  '.MediaViewer',
  '.media-viewer',
  '[class*="media-viewer"]',
  '[class*="MediaViewer"]',
  '[role="dialog"]',
].join(',');

export function findMediaAt(
  document: Document,
  target: EventTarget | null,
  x: number,
  y: number,
): HTMLImageElement | HTMLVideoElement | undefined {
  const element = target as Element | null;
  if (typeof element?.closest !== 'function') return undefined;
  const owner = element.closest(viewerSelector);
  const direct = element.closest<HTMLImageElement | HTMLVideoElement>('img,video');
  const pointed = document
    .elementFromPoint(x, y)
    ?.closest<HTMLImageElement | HTMLVideoElement>('img,video');
  const ownedMedia = owner?.querySelectorAll?.<HTMLImageElement | HTMLVideoElement>('img,video') ?? [];
  const candidates = [direct, pointed, ...ownedMedia].filter(
    (media): media is HTMLImageElement | HTMLVideoElement => Boolean(media),
  );

  return candidates.find((media) => {
    const rect = media.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}

export function isPreviewMedia(
  media: { closest?: (selector: string) => unknown } | null | undefined,
): boolean {
  return Boolean(media?.closest?.('.media-viewer-mover'));
}

export function canOpenDownloadMenu(
  menuBusy: boolean,
  media: { closest?: (selector: string) => unknown } | null | undefined,
): boolean {
  return !menuBusy && isPreviewMedia(media);
}
