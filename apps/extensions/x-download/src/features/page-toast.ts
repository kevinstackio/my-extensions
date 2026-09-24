export const X_PAGE_TOAST_MESSAGE = 'x-download:page-toast';
export const X_PAGE_TOAST_TEXT = '已开始下载，可在扩展中查看进度';

type Schedule = (callback: () => void, delay: number) => unknown;

function defaultSchedule(callback: () => void, delay: number): unknown {
  return globalThis.setTimeout(callback, delay);
}

export function showXPageToast(
  document: Document,
  text: string,
  schedule: Schedule = defaultSchedule,
): void {
  document.querySelector('.x-download-page-toast')?.remove();

  const toast = document.createElement('div');
  toast.className = 'x-download-page-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = text;
  (document.body ?? document.documentElement).append(toast);

  schedule(() => {
    toast.classList.add('x-download-page-toast--leaving');
    schedule(() => toast.remove(), 300);
  }, 1200);
}
