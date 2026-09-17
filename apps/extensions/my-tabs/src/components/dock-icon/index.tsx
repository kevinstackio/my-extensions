import { BookmarkIcon } from '../bookmark-icon';
import { UiIcon } from '../ui/ui-icon';
import type { DockIcon } from '../../types/icons';

interface DockIconViewProps {
  icon: DockIcon;
  name: string;
  className?: string;
}

function assertNever(value: never): never {
  throw new Error(`不支持的 Dock 图标：${JSON.stringify(value)}`);
}

export function DockIconView({ icon, name, className }: DockIconViewProps) {
  switch (icon.kind) {
    case 'ui':
      return <UiIcon name={icon.name} className={className} />;
    case 'asset':
      return (
        <BookmarkIcon
          icon={icon.source}
          name={name}
          tone={icon.tone}
          size={icon.size}
          className={className}
        />
      );
    default:
      return assertNever(icon);
  }
}
