import type { XPostTarget } from '../post-url';
import type { MediaSource } from '../media-source/model';
import {
  NATIVE_HOST_NAME,
  createEnqueueRequest,
  parseNativeResponse,
  type EnqueueError,
  type EnqueueResult,
} from './protocol';

export type NativeMessageSender = (hostName: string, message: unknown) => Promise<unknown>;
export type NativeFailureState = 'helperMissing' | 'connectionFailed';

export async function sendEnqueueRequest(
  target: XPostTarget,
  requestId: string,
  send: NativeMessageSender,
  mediaSources: MediaSource[] = [],
): Promise<EnqueueResult | EnqueueError> {
  const response = await send(NATIVE_HOST_NAME, createEnqueueRequest(target, requestId, mediaSources));
  return parseNativeResponse(response, requestId);
}

export function classifyNativeFailure(error: unknown): NativeFailureState {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
      ? error.message
      : String(error);
  return /host\s+(?:not found|not installed)|native messaging host/i.test(message)
    ? 'helperMissing'
    : 'connectionFailed';
}
