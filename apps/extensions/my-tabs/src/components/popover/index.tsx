import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';
type PopoverTriggerProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };

interface PopoverProps {
  trigger: ReactElement<PopoverTriggerProps>;
  children: ReactNode;
  placement?: Placement;
  showArrow?: boolean;
}

/** 渲染由外部触发器控制的通用浮层。 */
export function Popover({ trigger, children, placement = 'top', showArrow = true }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const isRestoringFocus = useRef(false);

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
    if (restoreFocus && triggerRef.current) {
      // 恢复焦点时忽略由 focus() 同步触发的打开事件，避免浮层关闭后立即重开。
      isRestoringFocus.current = true;
      triggerRef.current.focus();
      isRestoringFocus.current = false;
    }
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
    'aria-expanded': isOpen,
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
      if (!isRestoringFocus.current) open();
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

  return (
    <>
      {triggerNode}
      <section
        className="popover"
        data-placement={placement}
        data-arrow={String(showArrow)}
        tabIndex={-1}
        hidden={!isOpen}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          close();
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {children}
      </section>
    </>
  );
}
