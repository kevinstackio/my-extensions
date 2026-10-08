import { parseXPostUrl, type XPostTarget } from '../post-url';
import { parseMediaSources } from '../media-source/bridge-message';
import type { MediaSource } from '../media-source/model';
import { X_PAGE_TOAST_MESSAGE, X_PAGE_TOAST_TEXT } from '../page-toast';
import {
  classifyNativeFailure,
  sendEnqueueRequest,
  sendPopupRequest,
  type NativeMessageSender,
} from './client';
import type { PopupCommandType } from './protocol';
import type { PopupState } from './popup-state';

export const POPUP_GET_STATE_MESSAGE = 'x-download:popup:get-state';
export const POPUP_OPEN_DOWNLOADS_MESSAGE = 'x-download:popup:open-downloads';
export const POPUP_CLEAR_FAILED_MESSAGE = 'x-download:popup:clear-failed';

export interface ActiveTab { id?: number; url?: string }

export interface EnqueueCurrentTabDependencies {
  getActiveTab: () => Promise<ActiveTab | undefined>;
  getMediaSources?: (tabId: number, postId: string, timeoutMs: number) => Promise<unknown>;
  sendNativeMessage: NativeMessageSender;
  notifyPage?: (tabId: number, message: { type: string; text: string }) => Promise<unknown> | unknown;
  createRequestId?: () => string;
}

export interface PopupCommandDependencies {
  sendNativeMessage: NativeMessageSender;
  createRequestId?: () => string;
}

export interface PopupTaskState {
  failedTaskCount: number;
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
    if (!result.ok) return 'connectionFailed';
    if (tabId !== undefined && dependencies.notifyPage) {
      // 页面提示失败不影响已经成功入队的任务，避免内容脚本重载导致状态被误判。
      await Promise.resolve(dependencies.notifyPage(tabId, {
        type: X_PAGE_TOAST_MESSAGE,
        text: X_PAGE_TOAST_TEXT,
      })).catch(() => undefined);
    }
    return 'accepted';
  } catch (error) {
    return classifyNativeFailure(error);
  }
}

export async function getPopupTaskState(dependencies: PopupCommandDependencies): Promise<PopupTaskState> {
  const result = await sendPopupRequest(
    'popup.snapshot',
    dependencies.createRequestId?.() ?? crypto.randomUUID(),
    dependencies.sendNativeMessage,
  );
  return result.ok ? { failedTaskCount: result.failedTaskCount } : { failedTaskCount: 0 };
}

export async function sendPopupAction(
  type: Exclude<PopupCommandType, 'popup.snapshot'>,
  dependencies: PopupCommandDependencies,
): Promise<PopupTaskState | undefined> {
  try {
    const result = await sendPopupRequest(
      type,
      dependencies.createRequestId?.() ?? crypto.randomUUID(),
      dependencies.sendNativeMessage,
    );
    return result.ok ? { failedTaskCount: result.failedTaskCount } : undefined;
  } catch {
    return undefined;
  }
}

export function nativeTargetForTab(tab: ActiveTab | undefined): XPostTarget | null {
  return parseXPostUrl(tab?.url);
}
