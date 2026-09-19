import { browser } from 'wxt/browser';

import { popupText, type PopupState } from '../../features/native-messaging/popup-state';
import './style.css';

const app = document.querySelector<HTMLElement>('#app');

function render(state: PopupState): void {
  if (!app) return;
  const text = popupText[state];
  app.innerHTML = `<h1>${text.title}</h1>${text.body ? `<p>${text.body}</p>` : ''}`;
}

render('checking');
const state = await browser.runtime.sendMessage({ type: 'enqueue-current-tab' }) as PopupState;
if (state === 'accepted') {
  window.close();
} else {
  render(state);
}
