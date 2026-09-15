import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

const globalNames = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'Node',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'getComputedStyle',
  'IS_REACT_ACT_ENVIRONMENT',
];

/**
 * 在独立的 happy-dom 文档中渲染 React 节点，并在测试结束时恢复 Node 全局对象。
 *
 * @param {import('react').ReactNode} element 要渲染的 React 节点。
 * @returns {Promise<{window: Window, document: Document, container: HTMLElement, rerender: (next: import('react').ReactNode) => Promise<void>, cleanup: () => Promise<void>}>}
 */
export async function renderReact(element) {
  const dom = new Window();
  const previousGlobals = Object.fromEntries(globalNames.map((name) => [name, globalThis[name]]));

  const installGlobal = (name, value) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    });
  };

  installGlobal('window', dom);
  installGlobal('document', dom.document);
  installGlobal('navigator', dom.navigator);
  installGlobal('HTMLElement', dom.HTMLElement);
  installGlobal('Node', dom.Node);
  installGlobal('Event', dom.Event);
  installGlobal('MouseEvent', dom.MouseEvent);
  installGlobal('KeyboardEvent', dom.KeyboardEvent);
  installGlobal('getComputedStyle', dom.getComputedStyle.bind(dom));
  installGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  const container = dom.document.createElement('div');
  dom.document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(element);
  });

  return {
    window: dom,
    document: dom.document,
    container,
    async rerender(next) {
      await act(async () => {
        root.render(next);
      });
    },
    async cleanup() {
      await act(async () => {
        root.unmount();
      });
      for (const [name, value] of Object.entries(previousGlobals)) {
        if (value === undefined) delete globalThis[name];
        else installGlobal(name, value);
      }
      dom.happyDOM.cancelAsync();
    },
  };
}
