import type { DownloadMenuController } from '../../features/download/download-media';

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export interface DownloadMenu extends DownloadMenuController {
  busy(): boolean;
  contains(target: EventTarget | null): boolean;
  open(pointer: Point): void;
}

interface MenuDependencies {
  setTimeout(callback: () => void, delay: number): unknown;
  viewport(): Size;
}

export function menuPosition(pointer: Point, size: Size, viewport: Size): {
  left: number;
  top: number;
} {
  return {
    left: Math.max(0, Math.min(pointer.x, viewport.width - size.width)),
    top: Math.max(0, Math.min(pointer.y, viewport.height - size.height)),
  };
}

function defaultDependencies(): MenuDependencies {
  return {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    viewport: () => ({
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
    }),
  };
}

export function createDownloadMenu(
  document: Document,
  onSave: () => void,
  dependencies = defaultDependencies(),
): DownloadMenu {
  let card: HTMLDivElement | undefined;
  let button: HTMLButtonElement | undefined;
  let label: HTMLSpanElement | undefined;
  let toast: HTMLDivElement | undefined;

  const setState = (text: string, state: 'download' | 'loading') => {
    if (!button || !label) return;
    button.dataset.state = state;
    label.textContent = text;
  };

  const close = () => {
    card?.remove();
    card = undefined;
    button = undefined;
    label = undefined;
  };

  const clearToast = () => {
    toast?.remove();
    toast = undefined;
  };

  const dismissToast = () => {
    if (!toast) return;
    const activeToast = toast;
    activeToast.classList.add('tg-download-toast--leaving');
    dependencies.setTimeout(() => {
      if (toast !== activeToast) return;
      activeToast.remove();
      toast = undefined;
    }, 300);
  };

  const dismiss = (duration: number) => {
    if (!card) return;
    card.classList.add('tg-download-menu--leaving');
    dependencies.setTimeout(close, duration);
  };

  const open = (pointer: Point) => {
    close();
    clearToast();

    card = document.createElement('div');
    button = document.createElement('button');
    const icon = document.createElement('span');
    label = document.createElement('span');

    card.className = 'tg-download-menu';
    button.className = 'tg-download-menu__item';
    button.type = 'button';
    icon.className = 'tg-download-menu__icon';
    icon.setAttribute('aria-hidden', 'true');
    label.className = 'tg-download-menu__label';
    button.append(icon, label);
    setState('下载资源', 'download');
    button.addEventListener('click', onSave);
    card.append(button);
    document.body.append(card);

    const viewport = dependencies.viewport();
    const position = menuPosition(
      pointer,
      {
        width: card.offsetWidth || 132,
        height: card.offsetHeight || 40,
      },
      {
        width: viewport.width || pointer.x,
        height: viewport.height || pointer.y,
      },
    );
    card.style.left = `${position.left}px`;
    card.style.top = `${position.top}px`;
  };

  return {
    busy: () => Boolean(button?.disabled),
    close,
    contains: target => Boolean(target && card?.contains(target as Node)),
    dismiss,
    loading: () => {
      if (!button) return;
      button.disabled = true;
      setState('正在下载', 'loading');
    },
    notice: (text, duration) => {
      if (!card) return;

      // 下载任务已经脱离页面菜单继续执行，关闭可点击浮层并只保留页面层 Toast。
      close();
      clearToast();
      const pageToast = document.createElement('div');
      pageToast.className = 'tg-download-toast';
      pageToast.setAttribute('role', 'status');
      pageToast.setAttribute('aria-live', 'polite');
      pageToast.textContent = text;
      (document.body ?? document.documentElement).append(pageToast);
      toast = pageToast;
      dependencies.setTimeout(() => {
        dismiss(300);
        dismissToast();
      }, duration);
    },
    open,
    ready: () => {
      if (!button) return;
      button.disabled = false;
      setState('下载资源', 'download');
    },
    result: (text) => {
      if (!button) return;
      button.disabled = false;
      setState(text, 'download');
    },
  };
}
