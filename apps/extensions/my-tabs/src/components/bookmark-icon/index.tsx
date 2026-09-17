import { cva, type VariantProps } from 'class-variance-authority';

import type { IconSize, IconTone } from '../../types/icons';
import { getExtensionAsset } from '../../utils/common.js';

const bookmarkIconVariants = cva(
  'bookmark-icon block object-contain transition-[filter,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  {
    variants: {
      tone: {
        original: 'bookmark-icon--original',
        adaptive: 'bookmark-icon--adaptive',
      },
      size: {
        sm: 'bookmark-icon--sm h-4 w-4',
        md: 'bookmark-icon--md h-8 w-8',
        wide: 'bookmark-icon--wide h-7 w-10',
      },
    },
    defaultVariants: {
      tone: 'original',
      size: 'md',
    },
  },
);

interface BookmarkIconProps extends VariantProps<typeof bookmarkIconVariants> {
  icon: string;
  name: string;
  tone?: IconTone;
  size?: IconSize;
  className?: string;
}

/** 统一渲染书签图标，只对明确标记为 adaptive 的单色 SVG 应用主题转换。 */
export function BookmarkIcon({ icon, name: _name, tone = 'original', size = 'md', className }: BookmarkIconProps) {
  // 图标只承担装饰作用，书签名称由相邻文本或按钮 aria-label 提供。
  return (
    <img
      className={bookmarkIconVariants({ tone, size, className })}
      src={getExtensionAsset(icon)}
      alt=""
      aria-hidden="true"
      data-tone={tone}
      data-size={size}
    />
  );
}
