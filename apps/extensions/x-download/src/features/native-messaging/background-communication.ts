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
    const tabId = tab?.id;
    const mediaSources = tabId !== undefined && dependencies.getMediaSources
      ? await dependencies.getMediaSources(tabId, target.postId, 3000)
        .then(parseMediaSources)
        .catch((): MediaSource[] => [])
      : [];
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
