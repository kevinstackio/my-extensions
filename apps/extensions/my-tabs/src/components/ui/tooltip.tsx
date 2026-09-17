import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '../../lib/utils';

function TooltipProvider({
  delayDuration = 400,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  // 统一延迟，避免 Dock 在指针快速经过时连续闪现多个提示。
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    // Tooltip 使用 Portal 脱离 Dock 的层叠和裁剪上下文，保证提示层可见。
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-[var(--shadow-floating)]',
          className,
        )}
        {...props}
      >
        {children}
        {/* 箭头使用与气泡相同的语义背景色，连接 Tooltip 与触发器。 */}
        <TooltipPrimitive.Arrow width={10} height={5} className="fill-popover" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
