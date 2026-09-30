import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 统一处理条件类名和 Tailwind 冲突，避免组件各自维护字符串拼接规则。
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
