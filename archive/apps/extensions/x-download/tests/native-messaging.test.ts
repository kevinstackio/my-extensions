import { describe, expect, it } from 'vitest';

import { parseXPostUrl } from '../src/features/post-url';
import type { MediaSource } from '../src/features/media-source/model';
import {
  NATIVE_HOST_NAME,
  PROTOCOL_VERSION,
  createEnqueueRequest,
  createPopupRequest,
  parseNativeResponse,
  parsePopupResponse,
} from '../src/features/native-messaging/protocol';
import {
  classifyNativeFailure,
  sendEnqueueRequest,
  sendPopupRequest,
} from '../src/features/native-messaging/client';

describe('Native Messaging 协议', () => {
  const target = parseXPostUrl('https://x.com/OpenAI/status/1960000000000000000');
  if (!target) throw new Error('测试目标 URL 无效');

  it('creates the versioned task enqueue request', () => {
    expect(createEnqueueRequest(target, 'request-1', [{
      mediaId: 'video-1',
      type: 'mp4',
      url: 'https://video.twimg.com/video.mp4',
    }])).toEqual({
      protocolVersion: PROTOCOL_VERSION,
      requestId: 'request-1',
      type: 'task.enqueue',
      payload: {
        postId: '1960000000000000000',
        postUrl: 'https://x.com/OpenAI/status/1960000000000000000',
        mediaSources: [{
          mediaId: 'video-1',
          type: 'mp4',
          url: 'https://video.twimg.com/video.mp4',
        }],
      },
    });
  });

  it('rejects an enqueue request without complete media sources', () => {
    expect(() => createEnqueueRequest(target, 'request-empty', [])).toThrow('媒体来源不能为空');
  });

  it('passes sanitized page media sources through the v2 request', () => {
    const mediaSources: MediaSource[] = [{
      mediaId: 'video-1',
      type: 'dash',
      url: 'https://video.twimg.com/video.mpd',
    }];

    expect(createEnqueueRequest(target, 'request-2', mediaSources).payload.mediaSources).toEqual(mediaSources);
  });

  it.each([
    'popup.snapshot',
    'popup.open-downloads',
    'popup.clear-failed',
  ] as const)('creates the %s Popup command request', type => {
    expect(createPopupRequest(type, 'popup-request-1')).toEqual({
      protocolVersion: PROTOCOL_VERSION,
      requestId: 'popup-request-1',
      type,
      payload: {},
    });
  });

  it.each(['created', 'existing'] as const)('accepts a %s response', (disposition) => {
    expect(parseNativeResponse({
      protocolVersion: 2,
      requestId: 'request-1',
      ok: true,
      result: { taskId: 'task-1', disposition },
    }, 'request-1')).toEqual({
      ok: true,
      taskId: 'task-1',
      disposition,
    });
  });

  it('accepts the six stable error codes', () => {
    for (const code of [
      'INVALID_REQUEST',
      'UNSUPPORTED_PROTOCOL',
      'UNSUPPORTED_MESSAGE',
      'HELPER_START_TIMEOUT',
      'HELPER_UNAVAILABLE',
      'INTERNAL_ERROR',
    ] as const) {
      expect(parseNativeResponse({
        protocolVersion: 2,
        requestId: 'request-1',
        ok: false,
        error: { code, message: '失败' },
      }, 'request-1')).toEqual({ ok: false, code, message: '失败' });
    }
  });

  it.each([
    [{ protocolVersion: 2, requestId: 'request-1', ok: true }, '版本不符'],
      [{ protocolVersion: 2, requestId: 'request-2', ok: true }, '请求 ID 不符'],
      [{ protocolVersion: 2, requestId: 'request-1', ok: true, result: { disposition: 'created' } }, '未知成功响应'],
      [{ protocolVersion: 2, requestId: 'request-1', ok: false, error: { code: 'NOPE', message: '失败' } }, '未知错误码'],
  ])('rejects %s (%s)', (value, _description) => {
    expect(() => parseNativeResponse(value, 'request-1')).toThrow();
  });

  it('sends one request and validates its response', async () => {
    const calls: Array<{ host: string; message: unknown }> = [];
    const result = await sendEnqueueRequest(target, 'request-1', async (host, message) => {
      calls.push({ host, message });
      return { protocolVersion: 2, requestId: 'request-1', ok: true, result: { taskId: 'task-1', disposition: 'created' } };
    }, [{
      mediaId: 'video-1',
      type: 'mp4',
      url: 'https://video.twimg.com/video.mp4',
    }]);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.host).toBe(NATIVE_HOST_NAME);
    expect(result).toEqual({ ok: true, taskId: 'task-1', disposition: 'created' });
  });

  it('sends a Popup command and reads the failed task count', async () => {
    const calls: unknown[] = [];
    const result = await sendPopupRequest(
      'popup.snapshot',
      'popup-request-1',
      async (_host, message) => {
        calls.push(message);
        return {
          protocolVersion: 2,
          requestId: 'popup-request-1',
          ok: true,
          result: { failedTaskCount: 2 },
        };
      },
    );

    expect(calls).toEqual([{
      protocolVersion: 2,
      requestId: 'popup-request-1',
      type: 'popup.snapshot',
      payload: {},
    }]);
    expect(result).toEqual({ ok: true, failedTaskCount: 2 });
  });

  it('accepts an empty failed task count after clearing', () => {
    expect(parsePopupResponse({
      protocolVersion: 2,
      requestId: 'popup-request-2',
      ok: true,
      result: { failedTaskCount: 0 },
    }, 'popup-request-2')).toEqual({ ok: true, failedTaskCount: 0 });
  });

  it('maps a missing host separately from connection failures', () => {
    expect(classifyNativeFailure({ message: 'Specified native messaging host not found.' })).toBe('helperMissing');
    expect(classifyNativeFailure(new Error('The message port closed'))).toBe('connectionFailed');
  });
});
