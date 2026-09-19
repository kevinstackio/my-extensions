export type PopupState = 'checking' | 'invalidPage' | 'helperMissing' | 'connectionFailed' | 'accepted';

export const popupText: Record<PopupState, { title: string; body: string }> = {
  checking: { title: '正在连接 X Download Helper…', body: '' },
  invalidPage: {
    title: '当前页面不是 X 单篇帖子',
    body: '请打开需要处理的帖子后重试。',
  },
  helperMissing: {
    title: '未检测到 X Download Helper',
    body: '请先安装并启动 Helper，然后再次点击扩展。',
  },
  connectionFailed: {
    title: '无法连接 X Download Helper',
    body: '请确认 Helper 可用后再试。',
  },
  accepted: { title: '已发送到 X Download Helper', body: '' },
};

export function popupStateForFailure(state: 'helperMissing' | 'connectionFailed'): PopupState {
  return state;
}
