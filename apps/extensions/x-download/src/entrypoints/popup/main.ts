import { browser } from 'wxt/browser';

import {
  POPUP_CLEAR_FAILED_MESSAGE,
  POPUP_GET_STATE_MESSAGE,
  POPUP_OPEN_DOWNLOADS_MESSAGE,
} from '../../features/native-messaging/background-communication';
import { popupText, type PopupState } from '../../features/native-messaging/popup-state';
import './style.css';

const app = document.querySelector<HTMLElement>('#app');
let currentState: PopupState = 'checking';
let failedTaskCount = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readFailedTaskCount(value: unknown): number | undefined {
  if (!isRecord(value)
    || typeof value.failedTaskCount !== 'number'
    || !Number.isInteger(value.failedTaskCount)
    || value.failedTaskCount < 0) return undefined;
  return value.failedTaskCount;
}

function createIconButton(
  label: string,
  iconName: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('img');
  button.className = 'x-download-popup__action';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  icon.src = `/icon/${iconName}.svg`;
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);
  button.addEventListener('click', onClick);
  return button;
}

function render(state: PopupState, nextFailedTaskCount = failedTaskCount): void {
  if (!app) return;
  currentState = state;
  failedTaskCount = nextFailedTaskCount;
  app.replaceChildren();

  const header = document.createElement('header');
  const title = document.createElement('h1');
  const actions = document.createElement('div');
  const content = document.createElement('section');
  const divider = document.createElement('div');
  const folderButton = createIconButton(
    '打开 Downloads 文件夹',
    'folder-down',
    () => { void browser.runtime.sendMessage({ type: POPUP_OPEN_DOWNLOADS_MESSAGE }); },
  );
  const clearButton = createIconButton(
    '清理失败任务',
    'trash',
    () => {
      void browser.runtime.sendMessage({ type: POPUP_CLEAR_FAILED_MESSAGE })
        .then(value => {
          const count = readFailedTaskCount(value);
          if (count !== undefined) render(currentState, count);
        })
        .catch(() => {});
    },
  );
  const text = popupText[state];

  header.className = 'x-download-popup__header';
  title.className = 'x-download-popup__title';
  title.textContent = '下载';
  actions.className = 'x-download-popup__actions';
  actions.append(folderButton, clearButton);
  header.append(title, actions);
  divider.className = 'x-download-popup__divider';
  content.className = 'x-download-popup__content';
  clearButton.disabled = failedTaskCount === 0;

  const statusTitle = document.createElement('h2');
  statusTitle.className = 'x-download-popup__status-title';
  statusTitle.textContent = text.title;
  content.append(statusTitle);
  if (text.body) {
    const body = document.createElement('p');
    body.className = 'x-download-popup__status-body';
    body.textContent = text.body;
    content.append(body);
  }

  app.append(header, divider, content);
}

render('checking');

let initialFailedTaskCount = 0;
try {
  initialFailedTaskCount = readFailedTaskCount(await browser.runtime.sendMessage({
    type: POPUP_GET_STATE_MESSAGE,
  })) ?? 0;
} catch {
  initialFailedTaskCount = 0;
}

const state = await browser.runtime.sendMessage({ type: 'enqueue-current-tab' }) as PopupState;
render(state, initialFailedTaskCount);
