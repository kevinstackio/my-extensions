import type { XPostTarget } from '../post-url';
import type { MediaSource } from '../media-source/model';

export const NATIVE_HOST_NAME = 'dev.kevinstack.xdownloadhelper.nativehost';
export const PROTOCOL_VERSION = 2;

export type EnqueueDisposition = 'created' | 'existing';
export type NativeMessageErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_PROTOCOL'
  | 'UNSUPPORTED_MESSAGE'
  | 'HELPER_START_TIMEOUT'
  | 'HELPER_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface EnqueueRequest {
  protocolVersion: 2;
  requestId: string;
  type: 'task.enqueue';
  payload: { postId: string; postUrl: string; mediaSources: MediaSource[] };
}

export interface EnqueueResult {
  ok: true;
  taskId: string;
  disposition: EnqueueDisposition;
}

export interface EnqueueError {
  ok: false;
  code: NativeMessageErrorCode;
  message: string;
}

export function createEnqueueRequest(
  target: XPostTarget,
  requestId: string,
  mediaSources: MediaSource[] = [],
): EnqueueRequest {
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    type: 'task.enqueue',
    payload: { postId: target.postId, postUrl: target.url, mediaSources },
  };
}

export function parseNativeResponse(value: unknown, requestId: string): EnqueueResult | EnqueueError {
  if (!isRecord(value) || value.protocolVersion !== PROTOCOL_VERSION || value.requestId !== requestId) {
    throw new Error('Native Messaging 响应版本或请求 ID 无效');
  }

  if (value.ok === true) {
    if (!isRecord(value.result) || typeof value.result.taskId !== 'string' || !isDisposition(value.result.disposition)) {
      throw new Error('Native Messaging 成功响应格式无效');
    }
    return { ok: true, taskId: value.result.taskId, disposition: value.result.disposition };
  }

  if (value.ok === false && isRecord(value.error) && isErrorCode(value.error.code) && typeof value.error.message === 'string') {
    return { ok: false, code: value.error.code, message: value.error.message };
  }

  throw new Error('Native Messaging 响应格式无效');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDisposition(value: unknown): value is EnqueueDisposition {
  return value === 'created' || value === 'existing';
}

function isErrorCode(value: unknown): value is NativeMessageErrorCode {
  return value === 'INVALID_REQUEST'
    || value === 'UNSUPPORTED_PROTOCOL'
    || value === 'UNSUPPORTED_MESSAGE'
    || value === 'HELPER_START_TIMEOUT'
    || value === 'HELPER_UNAVAILABLE'
    || value === 'INTERNAL_ERROR';
}
