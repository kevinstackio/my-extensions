import { parseXPostUrl, type XPostTarget } from '../post-url';
import { classifyNativeFailure, sendEnqueueRequest, type NativeMessageSender } from './client';
import type { PopupState } from './popup-state';

export interface ActiveTab { url?: string }

export interface EnqueueCurrentTabDependencies {
  getActiveTab: () => Promise<ActiveTab | undefined>;
  sendNativeMessage: NativeMessageSender;
  createRequestId?: () => string;
}

export async function enqueueCurrentTab(dependencies: EnqueueCurrentTabDependencies): Promise<PopupState> {
  const tab = await dependencies.getActiveTab();
  const target = parseXPostUrl(tab?.url);
  if (!target) return 'invalidPage';

  try {
    const result = await sendEnqueueRequest(
      target,
      dependencies.createRequestId?.() ?? crypto.randomUUID(),
      dependencies.sendNativeMessage,
    );
    return result.ok ? 'accepted' : 'connectionFailed';
  } catch (error) {
    return classifyNativeFailure(error);
  }
}

export function nativeTargetForTab(tab: ActiveTab | undefined): XPostTarget | null {
  return parseXPostUrl(tab?.url);
}
