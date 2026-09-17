import { useRef, useState } from 'react';

import { BookmarkIcon } from '../../components/bookmark-icon';
import { DockIconView } from '../../components/dock-icon';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import type { BookmarkGroup, OpenBookmark } from '../../types/bookmarks';

interface DockToolMenuProps {
  group: BookmarkGroup;
  onOpenBookmark?: OpenBookmark;
}

/** Dock 工具分组入口：Tooltip 负责名称提示，DropdownMenu 负责显式激活后的工具列表。 */
export function DockToolMenu({ group, onOpenBookmark }: DockToolMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // Radix 点击外部关闭菜单时会恢复触发器焦点；记录指针关闭以避免留下 Focus 描边。
  const pointerDownOutsideRef = useRef(false);

  // 指针或键盘准备打开菜单时立即关闭 Tooltip，避免两层浮层同时出现。
  return (
    <Tooltip
      open={tooltipOpen && !menuOpen}
      onOpenChange={(open) => {
        if (!menuOpen) setTooltipOpen(open);
      }}
    >
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          // 菜单打开或关闭都清除 Tooltip，避免延迟状态在菜单关闭后重新显示。
          setTooltipOpen(false);
        }}
      >
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bookmark-card group bookmark-card--dock bookmark-dock__tool box-border h-16 w-16 flex-none cursor-pointer rounded-[var(--radius)] bg-transparent p-0 text-foreground hover:bg-transparent focus-visible:outline-none aria-expanded:bg-transparent"
              aria-label={`打开 ${group.name} 工具列表`}
              onPointerDown={() => setTooltipOpen(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                  setTooltipOpen(false);
                }
              }}
            >
              <span className="bookmark-card__icon grid h-16 w-16 place-items-center rounded-[var(--radius)] border border-border bg-card transition-[border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-hover:shadow-[var(--shadow-hover)] motion-safe:group-focus-visible:shadow-[var(--shadow-hover)] group-focus-visible:outline-2 group-focus-visible:outline-ring group-focus-visible:outline-offset-2">
                <DockIconView
                  icon={group.icon}
                  name={group.name}
                  className="motion-safe:group-hover:scale-[1.06] motion-safe:group-focus-visible:scale-[1.06]"
                />
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5}>{group.name}</TooltipContent>
        <DropdownMenuContent
          side="top"
          align="center"
          onPointerDownOutside={() => {
            pointerDownOutsideRef.current = true;
          }}
          onCloseAutoFocus={(event) => {
            if (!pointerDownOutsideRef.current) return;

            // 鼠标点击外部时不恢复触发器焦点，键盘 Esc 关闭仍保留焦点恢复。
            event.preventDefault();
            pointerDownOutsideRef.current = false;
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          }}
        >
          {group.bookmarks.map((bookmark) => (
            <DropdownMenuItem key={bookmark.id} asChild>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onOpenBookmark ? (event) => {
                  event.preventDefault();
                  onOpenBookmark(group, bookmark);
                } : undefined}
              >
                <BookmarkIcon
                  icon={bookmark.icon}
                  name={bookmark.name}
                  tone={bookmark.iconTone}
                  size="sm"
                  className="shrink-0"
                />
                <span>{bookmark.name}</span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
