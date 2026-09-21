import { describe, expect, it } from 'vitest';

import { enqueueCurrentTab } from '../src/features/native-messaging/background-communication';

const validTab = { id: 7, url: 'https://x.com/OpenAI/status/1960000000000000000' };

describe('扩展到 Native Messaging 的后台流程', () => {
  it('sends one valid active tab request and returns accepted', async () => {
    let sent = 0;
    const state = await enqueueCurrentTab({
      getActiveTab: async () => validTab,
      getMediaSources: async () => [{ mediaId: 'video-1', type: 'mp4', url: 'https://video.twimg.com/video.mp4' }],
      createRequestId: () => 'request-1',
      sendNativeMessage: async (_host, message) => {
        sent += 1;
        expect(message).toMatchObject({
          requestId: 'request-1',
          type: 'task.enqueue',
          protocolVersion: 2,
          payload: { mediaSources: [{ mediaId: 'video-1' }] },
        });
        return { protocolVersion: 2, requestId: 'request-1', ok: true, result: { taskId: 'task-1', disposition: 'created' } };
      },
    });
    expect(state).toBe('accepted');
    expect(sent).toBe(1);
  });

  it('does not call Native Messaging for an invalid page', async () => {
    let sent = false;
    const state = await enqueueCurrentTab({
      getActiveTab: async () => ({ url: 'https://x.com/home' }),
      sendNativeMessage: async () => { sent = true; return undefined; },
    });
    expect(state).toBe('invalidPage');
    expect(sent).toBe(false);
  });

  it('maps a missing host and a closed connection', async () => {
    const mediaSources = [{ mediaId: 'video-1', type: 'mp4' as const, url: 'https://video.twimg.com/video.mp4' }];
    await expect(enqueueCurrentTab({
      getActiveTab: async () => validTab,
      getMediaSources: async () => mediaSources,
      sendNativeMessage: async () => { throw new Error('Specified native messaging host not found.'); },
    })).resolves.toBe('helperMissing');
    await expect(enqueueCurrentTab({
      getActiveTab: async () => validTab,
      getMediaSources: async () => mediaSources,
      sendNativeMessage: async () => { throw new Error('The message port closed'); },
    })).resolves.toBe('connectionFailed');
  });

  it('does not contact Native Messaging when the page has no complete media source', async () => {
    let sent = false;
    const state = await enqueueCurrentTab({
      getActiveTab: async () => validTab,
      getMediaSources: async () => [],
      sendNativeMessage: async () => {
        sent = true;
        return undefined;
      },
    });

    expect(state).toBe('mediaUnavailable');
    expect(sent).toBe(false);
  });
});
