import { browser } from 'wxt/browser';

import {
  POPUP_CLEAR_FINISHED_MESSAGE,
  POPUP_GET_TASKS_MESSAGE,
  POPUP_OPEN_DOWNLOADS_MESSAGE,
  POPUP_TAB_REMOVED_MESSAGE,
  POPUP_TAB_SNAPSHOT_MESSAGE,
  type PopupTabSnapshot,
} from '../../features/download/background-tasks';
import {
  getProgressPresentation,
  createPopupTaskProjection,
  hasClearableTasks,
  type PopupTask,
} from '../../features/download/popup-model';
import { parseTaskSnapshot } from '../../features/download/task-protocol';
import './style.css';

const app = document.querySelector<HTMLElement>('#app');
const projection = createPopupTaskProjection();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readPopupTabSnapshot(value: unknown): PopupTabSnapshot | undefined {
  if (!isRecord(value) || typeof value.tabId !== 'number') return undefined;
  const snapshot = parseTaskSnapshot(value.snapshot);
  return snapshot ? { tabId: value.tabId, snapshot } : undefined;
}

function createIconButton(
  className: string,
  label: string,
  iconName: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('img');
  button.className = className;
  button.type = 'button';
  button.setAttribute('aria-label', label);
  icon.src = `/icon/${iconName}.svg`;
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);
  button.addEventListener('click', onClick);
  return button;
}

function createProgress(task: PopupTask): HTMLElement {
  const presentation = getProgressPresentation(task);
  const progress = document.createElement('div');
  const bar = document.createElement('div');
  progress.className = 'omydl-popup__progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  bar.className = 'omydl-popup__progress-bar';
  if (presentation.mode === 'determinate') {
    progress.setAttribute('aria-valuenow', String(presentation.percent));
    bar.style.width = `${presentation.percent}%`;
  } else {
    progress.classList.add('omydl-popup__progress--indeterminate');
  }
  progress.append(bar);
  return progress;
}

function createTaskRow(task: PopupTask): HTMLElement {
  const row = document.createElement('article');
  const filename = document.createElement('div');
  const details = document.createElement('div');
  const status = document.createElement('span');
  const presentation = getProgressPresentation(task);

  row.className = 'omydl-popup__task';
  if (task.state === 'failed') row.classList.add('omydl-popup__task--failed');
  if (task.state === 'completed') row.classList.add('omydl-popup__task--completed');
  filename.className = 'omydl-popup__filename';
  filename.textContent = task.filename;
  details.className = 'omydl-popup__task-details';
  status.className = 'omydl-popup__status';
  status.textContent = presentation.label;
  details.append(createProgress(task), status);
  row.append(filename, details);
  return row;
}

function render(tasks = projection.getTasks()): void {
  if (!app) return;
  app.replaceChildren();

  const header = document.createElement('header');
  const title = document.createElement('h1');
  const actions = document.createElement('div');
  const content = document.createElement('section');
  const divider = document.createElement('div');
  const folderButton = createIconButton(
    'omydl-popup__action',
    '打开 Downloads 文件夹',
    'folder-down',
    () => { void browser.runtime.sendMessage({ type: POPUP_OPEN_DOWNLOADS_MESSAGE }); },
  );
  const clearButton = createIconButton(
    'omydl-popup__action',
    '清除已完成和失败记录',
    'trash',
    () => { void browser.runtime.sendMessage({ type: POPUP_CLEAR_FINISHED_MESSAGE }); },
  );

  header.className = 'omydl-popup__header';
  title.className = 'omydl-popup__title';
  title.textContent = '下载';
  actions.className = 'omydl-popup__actions';
  actions.append(folderButton, clearButton);
  header.append(title, actions);
  divider.className = 'omydl-popup__divider';
  content.className = 'omydl-popup__content';
  // 仅有下载中任务时禁用清理按钮，避免用户误以为会取消正在进行的下载。
  clearButton.disabled = !hasClearableTasks(tasks);

  if (tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'omydl-popup__empty';
    empty.textContent = '没有下载任务';
    content.append(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'omydl-popup__list';
    for (const task of tasks) list.append(createTaskRow(task));
    content.append(list);
  }

  app.append(header, divider, content);
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (!isRecord(message)) return undefined;

  if (message.type === POPUP_TAB_SNAPSHOT_MESSAGE) {
    const update = readPopupTabSnapshot(message);
    if (update) {
      projection.applyTabSnapshot(update.tabId, update.snapshot);
      render();
    }
  } else if (message.type === POPUP_TAB_REMOVED_MESSAGE && typeof message.tabId === 'number') {
    projection.removeTab(message.tabId);
    render();
  }
  return undefined;
});

render();

const initialSnapshots = await browser.runtime.sendMessage({
  type: POPUP_GET_TASKS_MESSAGE,
});
if (Array.isArray(initialSnapshots)) {
  for (const value of initialSnapshots) {
    const update = readPopupTabSnapshot(value);
    if (update) projection.applyTabSnapshot(update.tabId, update.snapshot);
  }
  render();
}
