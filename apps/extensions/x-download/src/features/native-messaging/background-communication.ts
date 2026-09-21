import { parseXPostUrl, type XPostTarget } from '../post-url';
import { parseMediaSources } from '../media-source/bridge-message';
import type { MediaSource } from '../media-source/model';
import { classifyNativeFailure, sendEnqueueRequest, type NativeMessageSender } from './client';
import type { PopupState } from './popup-state';

export interface ActiveTab { id?: number; url?: string }

export interface EnqueueCurrentTabDependencies {
  getActiveTab: () => Promise<ActiveTab | undefined>;
  getMediaSources?: (tabId: number, postId: string, timeoutMs: number) => Promise<unknown>;
  sendNativeMessage: NativeMessageSender;
  createRequestId?: () => string;
}

export async function enqueueCurrentTab(dependencies: EnqueueCurrentTabDependencies): Promise<PopupState> {
  const tab = await dependencies.getActiveTab();
  const target = parseXPostUrl(tab?.url);
  if (!target) return 'invalidPage';

  try {
    // 先向页面请求完整媒体来源，故意不再把帖子 URL 交给 Helper 做解析降级。
    const tabId = tab?.id;
    const mediaSources = tabId !== undefined && dependencies.getMediaSources
      // 三秒只覆盖当前页面已捕获或即将返回的媒体信息，超时直接给用户可见状态。
      ? await dependencies.getMediaSources(tabId, target.postId, 3000)
        .then(parseMediaSources)
        .catch((): MediaSource[] => [])
      : [];
    if (mediaSources.length === 0) return 'mediaUnavailable';
    const result = await sendEnqueueRequest(
      target,
      dependencies.createRequestId?.() ?? crypto.randomUUID(),
      dependencies.sendNativeMessage,
      mediaSources,
    );
    return result.ok ? 'accepted' : 'connectionFailed';
  } catch (error) {
    return classifyNativeFailure(error);
  }
}

export function nativeTargetForTab(tab: ActiveTab | undefined): XPostTarget | null {
  return parseXPostUrl(tab?.url);
}
