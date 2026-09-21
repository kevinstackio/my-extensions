import { describe, expect, it } from 'vitest';

import { popupStateForFailure, popupText } from '../src/features/native-messaging/popup-state';

describe('Popup 状态', () => {
  it.each([
    ['checking', '正在获取视频来源…'],
    ['mediaUnavailable', '未获取到可下载的视频来源'],
    ['invalidPage', '当前页面不是 X 单篇帖子'],
    ['helperMissing', '未检测到 X Download Helper'],
    ['connectionFailed', '无法连接 X Download Helper'],
  ] as const)('提供 %s 的标题', (state, title) => {
    expect(popupText[state].title).toBe(title);
  });

  it('maps native host failures to helper missing or connection failed', () => {
    expect(popupStateForFailure('helperMissing')).toBe('helperMissing');
    expect(popupStateForFailure('connectionFailed')).toBe('connectionFailed');
  });
});
