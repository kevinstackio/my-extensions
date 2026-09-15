import {
  cloneElement,
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * 渲染由外部触发器控制的通用浮层。
 *
 * @param {{trigger: import('react').ReactElement, children: import('react').ReactNode, placement?: 'top' | 'bottom' | 'left' | 'right', showArrow?: boolean}} props 浮层触发器、内容和配置。
 * @returns {import('react').ReactElement} 浮层及其触发器。
 */
export function Popover({ trigger, children, placement = 'top', showArrow = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);
  const triggerRef = useRef(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const open = useCallback(() => {
    // 再次进入触发器时必须取消旧计时器，避免浮层在悬停期间被误关。
    cancelClose();
    setIsOpen(true);
  }, [cancelClose]);

  const close = useCallback((restoreFocus = true) => {
    cancelClose();
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => close(false), 160);
  }, [cancelClose, close]);

  useEffect(() => () => {
    cancelClose();
  }, [cancelClose]);

  const triggerNode = cloneElement(trigger, {
    ref: triggerRef,
    'aria-expanded': String(isOpen),
    onMouseEnter: (event) => {
      trigger.props.onMouseEnter?.(event);
      open();
    },
    onMouseLeave: (event) => {
      trigger.props.onMouseLeave?.(event);
      scheduleClose();
    },
    onFocus: (event) => {
      trigger.props.onFocus?.(event);
      open();
    },
    onClick: (event) => {
      trigger.props.onClick?.(event);
      open();
    },
    onKeyDown: (event) => {
      trigger.props.onKeyDown?.(event);
      if (event.key === 'Escape') close();
    },
  });

  return createElement(
    Fragment,
    null,
    triggerNode,
    createElement(
      'section',
      {
        className: 'popover',
        'data-placement': placement,
        'data-arrow': String(showArrow),
        tabIndex: -1,
        hidden: !isOpen,
        onKeyDown: (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          close();
        },
        onMouseEnter: cancelClose,
        onMouseLeave: scheduleClose,
      },
      children,
    ),
  );
}

/** 兼容迁移前测试的 DOM 工厂，页面运行时由 Popover 接管交互。 */
export function createPopover(document, trigger, content, options = {}) {
  const { placement = 'top', showArrow = true } = options;
  const element = document.createElement('section');
  let closeTimer;
  element.className = 'popover';
  element.setAttribute('data-placement', placement);
  element.setAttribute('data-arrow', String(showArrow));
  element.setAttribute('tabindex', '-1');
  element.setAttribute('hidden', 'true');
  element.append(content);
  function cancelClose() { clearTimeout(closeTimer); }
  function open() { cancelClose(); element.removeAttribute('hidden'); trigger.setAttribute('aria-expanded', 'true'); }
  function close(restoreFocus = true) { cancelClose(); element.setAttribute('hidden', 'true'); trigger.setAttribute('aria-expanded', 'false'); if (restoreFocus) trigger.focus(); }
  function scheduleClose() { cancelClose(); closeTimer = setTimeout(() => close(false), 160); }
  element.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; event.preventDefault(); close(); });
  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', scheduleClose);
  trigger.addEventListener('focus', open);
  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  element.addEventListener('mouseenter', cancelClose);
  element.addEventListener('mouseleave', scheduleClose);
  return { element, open, close };
}
