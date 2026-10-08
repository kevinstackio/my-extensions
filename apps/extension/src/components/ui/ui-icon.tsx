import { Blocks, BrushCleaning, Wrench, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import type { UiIconName } from '../../types/icons';
import { cn } from '../../lib/utils';

const uiIconMap: Record<UiIconName, LucideIcon> = {
  blocks: Blocks,
  'brush-cleaning': BrushCleaning,
  wrench: Wrench,
};

interface UiIconProps extends Omit<ComponentProps<'svg'>, 'name'> {
  name: UiIconName;
}

function UiIcon({ name, className, ...props }: UiIconProps) {
  const Icon = uiIconMap[name];
  return <Icon aria-hidden="true" strokeWidth={1.75} className={cn('size-7', className)} {...props} />;
}

export { UiIcon };
