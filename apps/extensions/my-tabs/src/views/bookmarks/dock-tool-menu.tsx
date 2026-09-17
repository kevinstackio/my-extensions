import { useState } from 'react';

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
          if (open) setTooltipOpen(false);
        }}
      >
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bookmark-card group bookmark-card--dock bookmark-dock__tool box-border h-16 w-16 flex-none rounded-[var(--radius)] border border-transparent p-0 text-foreground aria-expanded:bg-accent"
              aria-label={`打开 ${group.name} 工具列表`}
            >
              <span className="bookmark-card__icon grid h-16 w-16 place-items-center rounded-[var(--radius)] border border-border bg-transparent transition-colors duration-[var(--duration-fast)] group-hover:bg-accent group-focus-visible:bg-accent group-aria-expanded:bg-accent">
                <DockIconView icon={group.icon} name={group.name} />
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">{group.name}</TooltipContent>
        <DropdownMenuContent side="top" align="center">
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
