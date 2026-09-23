# TG Download 视频下载任务 Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. 本仓库禁止子代理和并行任务，所有步骤必须在当前会话串行执行。

**Goal:** 视频确认保存路径后转为标签页内存任务并显示短暂提示，允许并发下载，并在扩展 Popup 中集中显示活跃与失败任务。

**Architecture:** MAIN world 保持下载执行和任务事实来源；isolated world 只校验并桥接固定页面事件与 runtime 消息；background 无持久状态地查询各 Telegram 标签页、转发快照并调用打开 Downloads 的特权 API；Popup 只维护打开期间的多标签页投影。

**Tech Stack:** WXT 0.21.4、TypeScript 7.0.2、Vitest 5.0.0、Chrome/Edge Manifest V3、原生 HTML/CSS/DOM API。

**Spec:** `docs/superpowers/specs/2026-09-23-tg-download-video-task-popup-design.md`

## Global Constraints

- 只处理视频任务；图片下载行为保持不变。
- 任务只存在于 Telegram 标签页内存，不使用 `storage`、IndexedDB 或文件持久化。
- 不增加队列、并发上限、取消、暂停、重试、历史记录、系统通知或工具栏数量角标。
- Popup 默认 `360 × 400px`，文案固定为“下载”和“没有下载任务”。
- 使用现有 `folder-down.svg` 与 `trash.svg`，不得重绘或改变 SVG 路径。
- 不引入 React、新依赖、假 DOM 环境或视觉交互测试。
- 所有新增代码注释使用中文；依赖版本保持精确版本。
- 一个 Issue 只形成一个最终 Git Commit；实施阶段不提交，用户验收和最终提交分别批准。

## Review Focus

- 用户取消文件保存窗口时不得创建任务或请求媒体；Task 2 增加取消分支测试。
- 用户修改保存文件名时 Popup 必须使用文件句柄的实际名称，而非建议名称；Task 2 增加重命名测试。
- 响应缺少总大小时下载必须继续且显示不确定进度；Task 1、Task 2 分别覆盖模型和回调。
- 页面伪造非法任务状态、负数字节数或额外敏感字段时 isolated bridge 必须拒绝；Task 1 增加协议校验测试。
- 标签页关闭或消息无响应时 Popup 不得保留失效任务或阻断其他标签页；Task 3、Task 4 增加聚合与移除测试。

---

### Task 1: 建立视频任务模型与受限协议

**Files:**
- Create: `apps/extensions/tg-download/src/features/download/task-store.ts`
- Create: `apps/extensions/tg-download/src/features/download/task-protocol.ts`
- Create: `apps/extensions/tg-download/tests/download-task-store.test.ts`
- Create: `apps/extensions/tg-download/tests/download-task-protocol.test.ts`

**Interfaces:**
- Produces: `VideoDownloadTask`、`TaskSnapshot`、`createVideoTaskStore()`、`isTaskSnapshot()`、固定页面事件名和 runtime 消息类型。
- `createVideoTaskStore()` exposes `start(filename)`, `progress(id, loadedBytes, totalBytes?)`, `fail(id, errorCode)`, `complete(id)`, `clearFailed()`, `snapshot()`, `subscribe(listener)`。

- [x] **Step 1: 先写任务生命周期失败测试**

  在 `download-task-store.test.ts` 固定以下行为：两个 `start()` 产生不同 ID；两项可同时为 `downloading`；进度按 ID 独立更新；`complete()` 立即移除；`fail()` 保留失败项；`clearFailed()` 只删除失败项；未知 `totalBytes` 保持为空；订阅者收到不可被外部修改的快照。

- [x] **Step 2: 运行任务模型测试并确认失败**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/download-task-store.test.ts`

  Expected: FAIL，原因是 `task-store.ts` 尚不存在。

- [x] **Step 3: 实现最小任务模型**

  使用以下稳定签名，不加入队列或持久化：

  ```ts
  type VideoDownloadState = 'downloading' | 'failed';
  interface VideoDownloadTask {
    id: string;
    filename: string;
    state: VideoDownloadState;
    loadedBytes: number;
    totalBytes?: number;
    errorCode?: string;
  }
  function createVideoTaskStore(options?: { createId?: () => string }): VideoTaskStore;
  ```

  `progress()` 对未知 ID 无操作，并把无效或倒退的字节数收敛为当前合法状态；每次真实变化后发布完整快照。

- [x] **Step 4: 写协议校验失败测试**

  在 `download-task-protocol.test.ts` 覆盖：有效快照通过；非法状态、空 ID、超长文件名、负数/非有限字节、`loadedBytes > totalBytes`、媒体 URL、文件句柄样式字段和未知顶层字段被拒绝；固定下行消息只有“请求快照”和“清理失败任务”。

- [x] **Step 5: 实现协议并运行两组测试**

  页面事件使用命名空间常量；runtime 消息使用可辨识联合类型。校验器只返回裁剪后的 `TaskSnapshot`，不得把原始页面对象直接传给扩展。

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/download-task-store.test.ts tests/download-task-protocol.test.ts`

  Expected: PASS。

### Task 2: 将视频下载接入独立任务生命周期

**Files:**
- Modify: `apps/extensions/tg-download/src/features/download/download-media.ts`
- Modify: `apps/extensions/tg-download/src/entrypoints/download.content.ts`
- Modify: `apps/extensions/tg-download/tests/download-media.test.ts`
- Create: `apps/extensions/tg-download/tests/download-content.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `VideoTaskStore`、页面事件常量与 `TaskSnapshot`。
- Produces: `VideoDownloadLifecycle` 参数，签名固定为 `start(filename)`, `progress(id, loadedBytes, totalBytes?)`, `complete(id)`, `fail(id, errorCode)`；MAIN world 注册快照请求和清理失败事件。

- [x] **Step 1: 扩展现有媒体保存测试并确认失败**

  增加以下断言：图片仍走 `loading/result/dismiss`；视频保存句柄返回后以 `handle.name` 创建任务并立即 `menu.close()`；视频不调用菜单 loading/result/ready；`writeResponse` 进度转发给对应任务；成功调用 `complete()`；请求或写入失败调用 `fail()`；取消选择器不创建任务也不 fetch；缺少 `Content-Length` 时仍上报 `totalBytes: undefined`。

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/download-media.test.ts`

  Expected: FAIL，现有 `saveMedia()` 没有任务生命周期参数且仍由菜单显示视频状态。

- [x] **Step 2: 最小改造 `saveMedia()`**

  将 `SaveFileHandle` 增加只读 `name`；生成建议文件名后调用 picker。仅当 `tagName === 'VIDEO'` 且 picker 成功返回时创建任务并关闭菜单，之后所有进度与终态只写任务；图片保留当前至少 300ms 的菜单成功反馈和失败恢复。

- [x] **Step 3: 写 MAIN world 编排失败测试**

  在不创建假 DOM 的前提下，把入口编排提取为可注入的纯函数并测试：菜单点击时捕获当时的媒体引用；第一个视频尚未完成时可以对第二个视频再次调用保存；快照请求发布当前 store；清理事件只调用 `clearFailed()`；媒体预览变化不清空 store。

- [x] **Step 4: 接入 MAIN world 任务 store 与页面事件**

  `download.content.ts` 在 `main()` 生命周期内只创建一个 store。store 更新时发布完整快照；收到固定请求事件时再次发布；收到固定清理事件时调用 `clearFailed()`。移除视频下载期间对共享菜单 `busy()` 的占用，确保任务执行 Promise 不阻塞下一次菜单操作。

- [x] **Step 5: 运行下载链路测试**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/download-media.test.ts tests/download-content.test.ts tests/range.test.ts tests/download-menu.test.ts`

  Expected: PASS，且图片既有测试保持通过。

### Task 3: 建立 isolated bridge 与无状态 background 聚合

**Files:**
- Create: `apps/extensions/tg-download/src/entrypoints/tasks.content.ts`
- Create: `apps/extensions/tg-download/src/features/download/background-tasks.ts`
- Modify: `apps/extensions/tg-download/src/entrypoints/background.ts`
- Modify: `apps/extensions/tg-download/wxt.config.ts`
- Create: `apps/extensions/tg-download/tests/background-tasks.test.ts`
- Modify: `apps/extensions/tg-download/tests/manifest.test.ts`

**Interfaces:**
- Consumes: Task 1 的协议校验器、页面事件和 runtime 消息类型。
- Produces: `createBackgroundTaskHandler(dependencies)`；Popup 可发送 `popup:get-tasks`、`popup:clear-failed`、`popup:open-downloads`，并接收按 `tabId` 标识的 `popup:tab-snapshot` 与 `popup:tab-removed`。

- [x] **Step 1: 写 background 与 Manifest 失败测试**

  `background-tasks.test.ts` 覆盖：只查询 `https://web.telegram.org/*`；一个标签页无响应时仍返回其他标签页；结果携带 `tabId`；清理命令只发给 Telegram 标签页；打开目录只调用一次 `showDefaultFolder()`；内容脚本更新使用 `sender.tab.id`，缺少合法 sender 时丢弃；标签页移除广播删除消息。

  `manifest.test.ts` 增加：isolated 内容脚本匹配 Telegram 且不声明 MAIN world；Manifest 只新增 `downloads` 权限；两个 Popup SVG 被复制到输出资源。Popup 入口由 Task 4 创建，并在 Task 5 的真实 WXT 构建产物中验证。

- [x] **Step 2: 运行测试并确认失败**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/background-tasks.test.ts tests/manifest.test.ts`

  Expected: FAIL，桥接入口、background handler、权限和 Popup 资源尚不存在。

- [x] **Step 3: 实现 isolated world 请求响应桥接**

  `tasks.content.ts` 监听 MAIN world 的快照事件，使用 `isTaskSnapshot()` 校验后向 background 发送更新。收到请求快照时注册一次性响应等待、发出固定页面请求事件并设置短超时；收到清理命令时只发出无载荷的固定清理事件。不得缓存任务集合或接受页面自定义命令。

- [x] **Step 4: 实现 background handler 并接入现有主题处理**

  保留 `handleThemeMessage()`。新 handler 通过依赖注入包装 `tabs.query`、`tabs.sendMessage`、`runtime.sendMessage` 和 `downloads.showDefaultFolder`；不保存跨消息任务 Map。查询使用 `Promise.allSettled()` 隔离单标签页错误，返回合法快照数组。

- [x] **Step 5: 更新 WXT 配置和资源映射**

  Manifest 增加精确的 `permissions: ['downloads']`。将 `folder-down.svg`、`trash.svg` 加入已有图标复制清单；由 WXT Popup 入口生成 `action.default_popup`，不增加 toolbar badge 配置。

- [x] **Step 6: 运行桥接和清单测试**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/background-tasks.test.ts tests/download-task-protocol.test.ts tests/manifest.test.ts`

  Expected: PASS。

### Task 4: 实现 Popup 投影与界面

**Files:**
- Create: `apps/extensions/tg-download/src/features/download/popup-model.ts`
- Create: `apps/extensions/tg-download/src/entrypoints/popup/index.html`
- Create: `apps/extensions/tg-download/src/entrypoints/popup/main.ts`
- Create: `apps/extensions/tg-download/src/entrypoints/popup/style.css`
- Create: `apps/extensions/tg-download/tests/popup-model.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `VideoDownloadTask`，Task 3 的按标签页快照和移除消息。
- Produces: `createPopupTaskProjection()`、`getProgressPresentation(task)`、`hasFailedTasks(tasks)`，供 DOM 入口渲染。

- [x] **Step 1: 写 Popup 投影失败测试**

  覆盖：初始为空；不同标签页同名 task ID 通过复合键并存；同一标签页新快照完全替换旧快照；`tab-removed` 清除该标签页；已知总大小生成限制在 0–100 的百分比；未知总大小标记为 indeterminate；任一失败任务启用清理按钮；只有下载中任务时清理按钮禁用。

- [x] **Step 2: 运行投影测试并确认失败**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/popup-model.test.ts`

  Expected: FAIL，`popup-model.ts` 尚不存在。

- [x] **Step 3: 实现纯投影模型**

  投影内部键使用 `${tabId}:${task.id}`，标签页快照采用替换语义而非增量猜测。输出按首次出现顺序稳定排列，不保存成功历史，不修改来自协议层的任务对象。

- [x] **Step 4: 建立 Popup 语义结构与样式**

  `index.html` 只提供应用挂载点和必要元信息。`main.ts` 创建 Header、标题、两个原生 button、分割线、空状态和任务行；图标使用扩展内 `/icon/folder-down.svg` 与 `/icon/trash.svg`。按钮必须有中文 `aria-label`，清理按钮按模型设置 `disabled`。

  `style.css` 固定 `html/body` 为 `360 × 400px`，Header 不滚动，内容区 `overflow-y: auto`；进度条使用原生或简单语义结构，未知总大小只做不确定状态，不新增装饰动画要求。

- [x] **Step 5: 接入 Popup 消息与重开恢复**

  启动时发送 `popup:get-tasks` 并一次替换全部投影；打开期间监听 `popup:tab-snapshot` 与 `popup:tab-removed`。文件夹按钮发送 `popup:open-downloads`；清理按钮发送 `popup:clear-failed`，不做乐观删除，等待标签页新快照。

- [x] **Step 6: 运行 Popup 与相关协议测试**

  Run: `pnpm --filter @my-extensions/tg-download exec vitest run tests/popup-model.test.ts tests/background-tasks.test.ts tests/download-task-protocol.test.ts`

  Expected: PASS。

### Task 5: 完整验证并停在用户验收

**Files:**
- Modify: `docs/changes/issues/2026-09-23-tg-download-video-task-popup-issue.md`
- Modify: `docs/changes/commits/2026-09-23-tg-download-video-task-popup-commit.md`

**Interfaces:**
- Consumes: Task 1–4 的完整实现。
- Produces: 可由用户加载的 `apps/extensions/tg-download/dist/chrome-mv3` 与真实验证记录。

- [x] **Step 1: 运行一次完整自动化测试**

  Run: `pnpm --filter @my-extensions/tg-download test`

  Expected: 所有 TG Download 测试通过，无 watch 进程。

- [x] **Step 2: 运行类型检查**

  Run: `pnpm --filter @my-extensions/tg-download typecheck`

  Expected: exit 0，无 TypeScript 错误。

- [x] **Step 3: 运行一次 WXT 构建**

  Run: `pnpm --filter @my-extensions/tg-download build`

  Expected: `dist/chrome-mv3` 构建成功；Manifest 包含 Popup 与 `downloads` 权限，两个 SVG 存在于 `icon/`。

- [x] **Step 4: 执行静态交付检查**

  Run: `git diff --check`

  Expected: 无空白错误。检查 `git status --short` 和 diff，确认没有无关文件、依赖或工具栏 badge 变化。

- [x] **Step 5: 更新文档并停在阶段验收**

  只记录实际完成内容和上述命令结果，把 Issue 切换为“待验收”；Commit 记录仍保持“最终提交未批准”。向用户提供加载 `apps/extensions/tg-download/dist/chrome-mv3` 的验收步骤：图片回归、单视频进度、关闭预览后继续、两个视频并发、Popup 重开、未知总大小、失败保留与清理、打开 Downloads、标签页关闭、无数量角标。

  另需在真实 Chrome/Edge 中确认：视频保存路径确认后下载按钮变为提示语并自动淡出，页面不主动打开 Popup，工具栏入口可手动查看任务。

  **Stop:** 用户验收前不整理最终 Commit message，不执行 `git commit`。
