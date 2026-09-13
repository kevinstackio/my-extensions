export function createDownloadFilename(kind: string, now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '_',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');

  return kind === 'VIDEO'
    ? `TG_VIDEO_${stamp}.mp4`
    : `TG_IMG_${stamp}.jpg`;
}
