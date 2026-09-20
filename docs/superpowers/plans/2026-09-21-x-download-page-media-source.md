# X Download 页面媒体来源下载 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 本仓库禁止子代理、并行任务和阶段性 Git Commit；所有步骤串行执行，最终只申请一次交付 Commit。

**Goal:** 让扩展从当前已登录 X 单帖页面取得完整视频来源，并由 Helper 在不读取或传递 Cookie 的前提下完成可靠下载。

**Architecture:** 主世界观察器只读取 X API 响应副本，纯解析器按当前 `postId` 选出完整 HLS、DASH 或 MP4；隔离世界桥进行不可信输入校验和短期内存缓存；后台把 v2 请求交给 Native Host。Helper 独立复验来源，在存在媒体来源时跳过帖子解析并复用现有串行下载链路，不存在来源时保留 v1 地址解析降级。

**Tech Stack:** WXT 0.21.4、TypeScript 7.0.2、Vitest 5.0.0、Chrome/Edge MV3、Swift 6、Foundation、Observation、XCTest、固定 Bundle yt-dlp/FFmpeg。

**Spec:** `docs/superpowers/specs/2026-09-21-x-download-page-media-source-design.md`

## Global Constraints

- 只处理 `x.com` 单帖视频；忽略图片、`blob:` 地址和孤立 `.m4s` 分片。
- 不读取或传递 Cookie、Authorization、浏览器 Profile、完整接口响应或页面 HTML。
- 不申请 `cookies` 权限，不读取浏览器目录，不使用 Shell，不启动本地 HTTP 服务。
- 页面、扩展消息和 Native Messaging 请求全部视为不可信输入；扩展与 Helper 分别校验。
- 当前帖子缓存只存在内存；SPA 导航后旧缓存不可返回，不增加持久化。
- 一个帖子仍是一条队列任务，以规范化帖子地址去重；多视频按页面顺序串行下载。
- 捕获探针原本是停止点；本次按用户明确要求跳过独立探针，媒体来源失败时继续走地址解析降级。
- 不实现取消、删除、手动重试、断点续传和多视频部分失败恢复。
- 所有新增代码注释使用中文；不新增假 DOM、截图、布局、焦点、指针或播放器交互测试。
- 一个 Issue 只产生一个最终交付 Commit；每个 Task 完成后停留在未提交工作区。

## Review Focus

- 页面伪造 `postMessage` 或返回恶意 URL 时，隔离桥与 Helper 必须分别拒绝非 HTTPS、非 `video.twimg.com` 和不完整分片。
- GraphQL 响应同时含当前帖、引用帖和其他时间线帖子时，只能返回当前 `postId` 的直接视频。
- X SPA 从帖子 A 切到帖子 B 后，即使 A 的响应晚到，也不能把 A 的来源交给 B。
- v2 扩展必须处理 v2 响应；更新后的 Helper 仍须接受 v1 地址请求并以请求版本响应。
- 同一地址运行中重复点击保持 existing；失败任务只有收到新的合法媒体来源才原位刷新并重新排队。

---

## Task 1: 视频媒体纯模型与提取器

**Files:**
- Create: `apps/extensions/x-download/src/features/media-source/model.ts`
- Create: `apps/extensions/x-download/src/features/media-source/extract.ts`
- Create: `apps/extensions/x-download/tests/media-source-extract.test.ts`

**Interfaces:**
- Consumes: `postId: string` 和已经解析成 `unknown` 的 X API JSON。
- Produces: `MediaSource { mediaId: string; type: 'hls' | 'dash' | 'mp4'; url: string }` 与 `extractMediaSources(value: unknown, postId: string): MediaSource[]`。

- [x] **Step 1: 写失败测试固定当前帖、来源优先级与拒绝边界**

```ts
const sources = extractMediaSources({
  data: { tweet: { result: {
    rest_id: '123',
    legacy: { extended_entities: { media: [
      { id_str: 'video-1', type: 'video', video_info: { variants: [
        { content_type: 'video/mp4', bitrate: 256000, url: 'https://video.twimg.com/a-low.mp4' },
        { content_type: 'application/x-mpegURL', url: 'https://video.twimg.com/a.m3u8' },
      ] } },
      { id_str: 'photo-1', type: 'photo', media_url_https: 'https://pbs.twimg.com/a.jpg' },
    ] } },
  } } },
}, '123');
expect(sources).toEqual([{ mediaId: 'video-1', type: 'hls', url: 'https://video.twimg.com/a.m3u8' }]);
```

同文件增加：DASH 优先于 MP4、最高 bitrate MP4、孤立 `.m4s`、`blob:`、其他域名、引用帖和重复 variant。

- [x] **Step 2: 运行目标测试并确认因模块不存在而失败**

Run: `pnpm --filter @my-extensions/x-download test -- tests/media-source-extract.test.ts`

Expected: FAIL，提示无法导入 `media-source/extract`。

- [x] **Step 3: 实现最小模型、当前帖定位和 variant 归一化**

```ts
export type MediaSourceType = 'hls' | 'dash' | 'mp4';
export interface MediaSource { mediaId: string; type: MediaSourceType; url: string }

export function extractMediaSources(value: unknown, postId: string): MediaSource[] {
  const tweet = findTweetByRestId(value, postId);
  if (!tweet) return [];
  return mediaItems(tweet)
    .filter(item => item.type === 'video' || item.type === 'animated_gif')
    .map(selectCompleteSource)
    .filter((source): source is MediaSource => source !== null);
}
```

`findTweetByRestId` 只定位 `rest_id === postId` 的对象；`mediaItems` 只读取该对象自己的 `legacy.extended_entities.media`，不递归收集引用帖媒体；URL 校验使用 `URL` 的 protocol、hostname 与 pathname。

- [x] **Step 4: 运行目标测试与 TypeScript 类型检查**

Run: `pnpm --filter @my-extensions/x-download test -- tests/media-source-extract.test.ts`

Expected: PASS。

Run: `pnpm --filter @my-extensions/x-download typecheck`

Expected: PASS。

## Task 2: 页面观察、隔离桥与可行性探针

**Files:**
- Create: `apps/extensions/x-download/src/features/media-source/page-observer.ts`
- Create: `apps/extensions/x-download/src/features/media-source/cache.ts`
- Create: `apps/extensions/x-download/src/features/media-source/bridge-message.ts`
- Create: `apps/extensions/x-download/src/entrypoints/media-observer.content.ts`
- Create: `apps/extensions/x-download/src/entrypoints/media-bridge.content.ts`
- Create: `apps/extensions/x-download/tests/media-source-observer.test.ts`
- Create: `apps/extensions/x-download/tests/media-source-cache.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `extractMediaSources`、当前 `location.href` 和 X API 的 fetch/XHR JSON 副本。
- Produces: `getCurrentMediaSources(postId: string, timeoutMs: number): Promise<MediaSource[]>`，供后台在 Task 3 查询。

- [x] **Step 1: 写失败测试固定响应不被消耗、晚到响应和缓存导航边界**

```ts
const original = new Response(JSON.stringify(targetPayload));
const wrapped = wrapFetch(async () => original, event => captured.push(event));
const returned = await wrapped(new Request('https://x.com/i/api/graphql/example'));
expect(await returned.json()).toEqual(targetPayload);
await flushObservedResponses();
expect(captured[0]?.postId).toBe('123');

const cache = new MediaSourceCache(() => 'https://x.com/user/status/456');
cache.accept({ postId: '123', mediaSources: validSources });
expect(await cache.get('456', 0)).toEqual([]);
```

增加非 X API 响应不解析、XHR 非 JSON/二进制响应不读取、帖子 A 晚到结果不污染帖子 B、`syncLocation` 在地址变化时清空缓存、等待超时返回空数组。

- [x] **Step 2: 运行两个目标测试并确认失败**

Run: `pnpm --filter @my-extensions/x-download test -- tests/media-source-observer.test.ts tests/media-source-cache.test.ts`

Expected: FAIL，提示观察器和缓存模块不存在。

- [x] **Step 3: 实现不改写页面结果的观察器与消息协议**

```ts
export interface MediaCaptureEvent {
  source: 'x-download-page-media';
  type: 'media-source.captured';
  postId: string;
  mediaSources: MediaSource[];
}

export function wrapFetch(originalFetch: typeof fetch, emit: (event: MediaCaptureEvent) => void): typeof fetch {
  return async (...args) => {
    const response = await originalFetch(...args);
    observeResponseClone(response.clone(), emit);
    return response;
  };
}
```

XHR 只在 URL 属于 `x.com/i/api/` 或 GraphQL 且响应类型为文本/JSON时读取副本；解析失败静默忽略。主世界只发候选事件，隔离桥重新解析当前 URL、验证 `postId` 和每个媒体 URL 后写入内存缓存。

- [x] **Step 4: 创建两个 `document_start` Content Script 并保持权限最小化**

```ts
export default defineContentScript({
  matches: ['https://x.com/*', 'https://www.x.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() { installPageMediaObserver(globalThis); },
});
```

隔离世界入口监听页面消息并响应 `media-source.get-current`；每次接收和查询都重新解析 `location.href`。入口用 `popstate` 和只比较地址字符串的 `MutationObserver` 调用纯函数 `cache.syncLocation(location.href)`，确保 X SPA 导航后旧帖缓存立即失效。不要增加 `cookies`、`webRequest` 或浏览器目录权限。

- [x] **Step 5: 运行测试、类型检查和扩展构建**

Run: `pnpm --filter @my-extensions/x-download test -- tests/media-source-extract.test.ts tests/media-source-observer.test.ts tests/media-source-cache.test.ts`

Expected: PASS。

Run: `pnpm --filter @my-extensions/x-download typecheck`

Expected: PASS。

Run: `pnpm --filter @my-extensions/x-download build`

Expected: PASS，确认生产构建没有入口或 Manifest 错误。

Run: `pnpm x:dev`

Expected: 首次开发构建完成并发布 `apps/extensions/x-download/dist/chrome-mv3-dev-stable` 后终止进程，不保持不必要的 watch。

- [x] **Step 6: 执行目标帖捕获停止点**（用户明确要求跳过独立捕获验收，直接继续完整链路）

加载 `apps/extensions/x-download/dist/chrome-mv3-dev-stable`，登录 X 后直接刷新目标帖子，不点击播放。检查经过隔离桥校验后的探针输出必须包含当前 `postId` 和至少一个完整 `.m3u8`、`.mpd` 或 `.mp4`。

Expected: Chrome 和 Edge 至少各完成一次未播放捕获。若只有 `blob:`、`.m4s` 或没有来源，记录结果并停止整个 Plan，不执行 Task 3–6。

## Task 3: 后台查询与 Native Messaging v2

**Files:**
- Modify: `apps/extensions/x-download/src/features/native-messaging/protocol.ts`
- Modify: `apps/extensions/x-download/src/features/native-messaging/client.ts`
- Modify: `apps/extensions/x-download/src/features/native-messaging/background-communication.ts`
- Modify: `apps/extensions/x-download/src/entrypoints/background.ts`
- Modify: `apps/extensions/x-download/tests/native-messaging.test.ts`
- Modify: `apps/extensions/x-download/tests/background-native-messaging.test.ts`

**Interfaces:**
- Consumes: Task 2 的 `getCurrentMediaSources` 消息响应。
- Produces: v2 `EnqueueRequest`，其 `payload.mediaSources` 为有序数组；无完整来源时发送空数组并由 Helper 降级。

- [x] **Step 1: 写失败测试固定三秒等待、v2 请求和无来源降级**

```ts
expect(createEnqueueRequest(target, 'request-1', sources)).toMatchObject({
  protocolVersion: 2,
  payload: { postId: target.postId, postUrl: target.url, mediaSources: sources },
});
expect(queryCalls).toEqual([{ tabId: 7, postId: target.postId, timeoutMs: 3000 }]);
```

增加 Content Script 不可用时仍发送空来源请求、响应版本或请求 ID 不符时拒绝。

- [x] **Step 2: 运行 Native Messaging 目标测试并确认失败**

Run: `pnpm --filter @my-extensions/x-download test -- tests/native-messaging.test.ts tests/background-native-messaging.test.ts`

Expected: FAIL，现有协议仍为 v1 且后台未查询媒体来源。

- [x] **Step 3: 升级协议并把标签页查询注入后台流程**

```ts
export const PROTOCOL_VERSION = 2;
export interface EnqueuePayload {
  postId: string;
  postUrl: string;
  mediaSources: MediaSource[];
}

export interface ActiveTab { id?: number; url?: string }
export interface EnqueueCurrentTabDependencies {
  getActiveTab: () => Promise<ActiveTab | undefined>;
  getMediaSources: (tabId: number, postId: string, timeoutMs: number) => Promise<MediaSource[]>;
  sendNativeMessage: NativeMessageSender;
}
```

后台仅在有效 tab ID 和帖子 URL 下查询；查询抛错或超时转为空数组，不阻止地址降级请求。

- [x] **Step 4: 运行扩展完整测试、类型检查和构建**

Run: `pnpm --filter @my-extensions/x-download test`

Expected: PASS。

Run: `pnpm --filter @my-extensions/x-download typecheck`

Expected: PASS。

Run: `pnpm --filter @my-extensions/x-download build`

Expected: PASS。

## Task 4: Helper v1/v2 协议、来源校验与失败任务刷新

**Files:**
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/VideoMediaSource.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoMediaSourceValidator.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Communication/NativeMessage.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadNativeHost/NativeMessage.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadNativeHost/NativeHostBridge.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Communication/HelperRequestHandler.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/DownloadTask.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/HelperRequestHandlerTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/DownloadTaskStoreTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/NativeHostBridgeTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`

**Interfaces:**
- Consumes: v1 可选 `mediaSources == nil` 或 v2 有序来源数组。
- Produces: `VideoMediaSource`、带 `mediaSources` 的 `DownloadTask`，以及失败任务合法刷新后触发的原任务重新入队。

- [x] **Step 1: 写失败 XCTest 固定协议兼容和双重校验**

```swift
let source = VideoMediaSource(mediaID: "video-1", type: .dash, url: URL(string: "https://video.twimg.com/a.mpd")!)
XCTAssertEqual(try VideoMediaSourceValidator().validate([source]), [source])
XCTAssertThrowsError(try VideoMediaSourceValidator().validate([
    .init(mediaID: "video-1", type: .mp4, url: URL(string: "https://example.com/a.mp4")!)
]))
```

增加 v1 无来源成功、v2 合法来源成功、错误后缀、`.m4s`、重复来源、帖子 ID 不匹配和响应协议版本跟随请求版本。

- [x] **Step 2: 写失败 Store 测试固定运行中去重与失败刷新**

```swift
store.updateState(for: taskID, state: .failed("旧错误"))
let refreshed = store.enqueue(postId: "123", postURL: postURL, mediaSources: [source])
XCTAssertEqual(refreshed, .existing(taskID))
XCTAssertEqual(store.tasks.first?.state, .queued)
XCTAssertEqual(store.tasks.first?.mediaSources, [source])
XCTAssertEqual(enqueuedTaskIDs, [taskID, taskID])
```

同时断言排队/下载中重复请求不触发第二次 `onTaskEnqueued`，失败后的空来源请求不清除错误。

- [x] **Step 3: 运行 Helper 目标 XCTest 并确认失败**

Run: `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -only-testing:XDownloadHelperTests/HelperRequestHandlerTests -only-testing:XDownloadHelperTests/DownloadTaskStoreTests`

Expected: 新测试在实现前失败；若仍被已知 `ObservationMacros ... malformed response` 阻断，记录环境限制并继续使用 Swift 6 类型检查与独立假执行器验证，不修改业务代码规避宏插件。

- [x] **Step 4: 实现 v1/v2 解码、动态响应版本和严格来源校验**

```swift
enum VideoMediaSourceType: String, Codable, Sendable { case hls, dash, mp4 }
struct VideoMediaSource: Codable, Equatable, Sendable {
    let mediaID: String
    let type: VideoMediaSourceType
    let url: URL

    enum CodingKeys: String, CodingKey {
        case mediaID = "mediaId"
        case type, url
    }
}

struct NativeMessagePayload: Codable, Equatable {
    let postId: String
    let postUrl: String
    let mediaSources: [VideoMediaSource]?
}
```

Helper 和 Native Host 都接受协议 1 和 2；协议 1 必须没有媒体来源，协议 2 把 `nil` 归一化为空数组。成功和失败响应的 `protocolVersion` 使用请求版本。Native Host 镜像结构同步更新，但仍只负责版本/消息类型边界、帧转发和 Helper 唤起。

- [x] **Step 5: 实现 Store 原位刷新，不新增第二个任务**

失败任务且新来源非空时更新 `mediaSources`、设为 `.queued`，并把同一 task 通过 `onTaskEnqueued` 交回协调器；其他重复状态仅返回 `.existing`。

- [x] **Step 6: 运行目标验证**

Run: `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -only-testing:XDownloadHelperTests/HelperRequestHandlerTests -only-testing:XDownloadHelperTests/DownloadTaskStoreTests`

Expected: PASS，或只出现已记录的 Observation 宏环境阻断。

## Task 5: Helper 直接来源下载与错误上下文

**Files:**
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/VideoPost.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoProcessRunner.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoDownloadCoordinator.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoProcessRunnerTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoDownloadCoordinatorTests.swift`

**Interfaces:**
- Consumes: Task 4 的 `DownloadTask.mediaSources`。
- Produces: 有来源时跳过 `parse(postURL:)`；无来源时保持现有解析；错误文本包含视频序号、来源类型、退出码和 stderr。

- [x] **Step 1: 写失败测试固定直接下载与地址降级分支**

```swift
_ = store.enqueue(postId: "123", postURL: postURL, mediaSources: [dashSource, mp4Source])
await coordinator.waitForIdle()
XCTAssertEqual(executor.parseCallCount, 0)
XCTAssertEqual(executor.downloadedURLs, [dashSource.url.absoluteString, mp4Source.url.absoluteString])
```

增加空来源仍调用一次帖子解析、多视频顺序、直接来源第二项失败时保留任务，以及错误文本包含“第 2/2 个视频”“dash/MP4”“退出码 1”和完整 stderr。

- [x] **Step 2: 运行协调器与进程目标测试并确认失败**

Run: `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -only-testing:XDownloadHelperTests/VideoProcessRunnerTests -only-testing:XDownloadHelperTests/VideoDownloadCoordinatorTests`

Expected: 新直接来源断言失败，或只出现已知宏插件环境阻断。

- [x] **Step 3: 让协调器按任务来源选择条目**

```swift
let entries: [VideoPostEntry]
if task.mediaSources.isEmpty {
    updateState(task.id, .parsing)
    entries = try runner.parse(postURL: task.postURL).entries
} else {
    entries = task.mediaSources.map { VideoPostEntry(url: $0.url, sourceType: $0.type) }
}
```

下载参数继续使用固定 Bundle 工具、参数数组、`--no-playlist`、最高质量和 FFmpeg 目录；不增加 Cookie、Header 或 Shell 参数。直接 MP4、HLS 和 DASH 都走同一个受控下载入口。

- [x] **Step 4: 为直接来源失败增加结构化上下文**

仅在直接来源分支包装当前 index/total/type；保留 `VideoProcessError.failed` 的退出码与完整 stderr。地址解析降级继续使用现有错误行为。

- [x] **Step 5: 运行 Helper 目标测试或等价独立验证**

Run: `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -only-testing:XDownloadHelperTests/VideoProcessRunnerTests -only-testing:XDownloadHelperTests/VideoDownloadCoordinatorTests`

Expected: PASS；若宏插件仍阻断，则运行与现有交付相同的 Swift 6 类型检查和临时假进程 harness，必须覆盖跳过解析、多视频顺序、失败保留和完整错误文本。

## Task 6: 完整验证、文档收口与用户验收

**Files:**
- Modify: `docs/changes/issues/2026-09-21-x-download-page-media-source-issue.md`
- Modify: `docs/changes/commits/2026-09-21-x-download-page-media-source-commit.md`
- Modify: `docs/superpowers/plans/2026-09-21-x-download-page-media-source.md`

**Interfaces:**
- Consumes: Task 1–5 的完整实现和验证结果。
- Produces: 待用户实际验收的稳定扩展产物与 Helper 构建，以及真实交付记录。

- [x] **Step 1: 串行运行扩展完整验证**

Run: `pnpm --filter @my-extensions/x-download test`

Run: `pnpm --filter @my-extensions/x-download typecheck`

Run: `pnpm --filter @my-extensions/x-download build`

Expected: 三项全部 PASS；生产构建不代替稳定开发产物验收。

Run: `pnpm x:dev`

Expected: 首次开发构建完成并发布 `apps/extensions/x-download/dist/chrome-mv3-dev-stable` 后终止进程。

- [x] **Step 2: 串行运行 Helper 验证**

Run: `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS'`

Run: `apps/helpers/x-download-helper/scripts/build.sh`

Run: `apps/helpers/x-download-helper/scripts/verify_app_bundle.sh`

Expected: 构建和 Bundle 验证通过；XCTest 如仍受同一 Observation 宏插件阻断，记录原始错误以及已通过的替代类型检查/harness，不重复修复重试。

- [x] **Step 3: 检查安全与仓库边界**

Run: `rg -n "cookies|Authorization|--add-header|\.m4s" apps/extensions/x-download/src apps/helpers/x-download-helper/XDownloadHelper apps/helpers/x-download-helper/XDownloadNativeHost`

Expected: 不存在 Cookie、Authorization 或新增 Header 传递；`.m4s` 只允许出现在拒绝校验或注释中。

Run: `git diff --check`

Expected: PASS。

- [x] **Step 4: 更新本地 Issue、Commit 记录和 Plan 实际结果**

只记录真实完成项、验证输出和限制；将 Issue 移至“待验收”。不得预先填写用户验收通过或最终提交批准。

- [ ] **Step 5: 停在用户实际验收**

用户在 Chrome 和 Edge 分别加载稳定产物，打开指定目标帖子且不播放视频，点击插件并观察 Helper：视频下载到桌面；连续点击不创建重复任务；断网或来源失效时保留可复制的完整失败信息。用户确认通过后，才能准备最终 Git Commit 审批。
