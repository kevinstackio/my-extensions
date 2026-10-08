/** 通用 UI 图标只允许使用已审核的静态 Lucide 映射。 */
export type UiIconName = 'blocks' | 'brush-cleaning' | 'wrench';

/** 图标颜色策略：品牌图标保留原色，单色资源才允许跟随主题反转。 */
export type IconTone = 'original' | 'adaptive';

/** 资源图标的展示尺寸，由实际使用区域决定。 */
export type IconSize = 'sm' | 'md' | 'wide';

/** Dock 顶层入口可以使用通用 UI 图标或保留的资源图标。 */
export type DockIcon =
  | { kind: 'ui'; name: UiIconName }
  | { kind: 'asset'; source: string; tone?: IconTone; size?: IconSize };
