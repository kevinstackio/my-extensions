# X Download 单帖链接识别架构设计

## 设计状态

- 对应 Issue：[`2026-09-19-x-download-post-url`](../../changes/issues/2026-09-19-x-download-post-url-issue.md)
- 状态：已批准
- 日期：2026-09-19

## 用户目标

用户必须先打开一篇具体的 X 帖子，再点击 `X Download` 工具栏图标。插件只从当前标签页地址识别这篇帖子，不从列表页猜测目标，也不收集用户浏览过的其他帖子。

第一版的交付结果是可测试的帖子地址识别边界，不是可用的媒体下载器。用户点击后不出现 popup、角标、Toast、系统通知或页面变化。

## 技术选型

插件使用仓库已有的 WXT + TypeScript 技术栈，不引入 React。实施时使用仓库当前锁定的精确版本：

- Node.js `24.16.0`
- pnpm `12.4.2`
- WXT `0.21.4`
- TypeScript `7.0.2`
- Vite `8.3.0`
- Vitest `5.0.0`
- `@types/chrome` `0.2.9`
- `@my-extensions/stable-extension-dev` `workspace:1.0.0`

不安装 UI 组件库、CSS 框架或状态管理依赖。项目接入公共稳定开发产物 hook，Chrome 或 Edge 只加载 `dist/chrome-mv3-dev-stable` 稳定目录。

## 目录与职责

```text
apps/extensions/x-download/
├─ src/
│  ├─ assets/
│  │  └─ logo/
│  │     ├─ x-download.svg
│  │     ├─ x-download-{16,32,48,128}.png
│  │     └─ x-download-light-{16,32,48,128}.png
│  ├─ entrypoints/
│  │  ├─ background.ts
│  │  └─ theme.content.ts
│  └─ features/
│     ├─ post-url.ts
│     └─ theme.ts
├─ tests/
│  ├─ post-url.test.ts
│  └─ theme.test.ts
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
└─ wxt.config.ts
```

- `background.ts`：只负责监听工具栏图标点击、取得当前 Tab 地址并调用识别函数。
- `theme.content.ts`：仅匹配 `x.com` 和 `www.x.com` 页面，监听 `prefers-color-scheme` 并发送主题消息；不读取 DOM，不识别帖子。
- `post-url.ts`：不依赖浏览器 API 的纯函数模块，负责验证、提取和规范化 X 帖子地址。
- `theme.ts`：主题消息、图标路径和系统主题监听的纯逻辑模块。
- `post-url.test.ts`：覆盖真实用户地址的成功、规范化和拒绝分支，不测试源码文本或内部实现形式。
- `theme.test.ts`：覆盖主题消息、图标路径、主题变化通知和合法消息分支，不测试页面脚本或浏览器外观。
- `wxt.config.ts`：定义 Manifest、图标资源和公共稳定产物 hook。
- 仓库根目录 `package.json`：只提供 `x:dev` 和 `x:build` 两个插件快捷脚本；测试和类型检查按需使用插件目录脚本。

文件保持单一职责，第一版不额外建立 service、repository、adapter 或消息协议层。

## Manifest 与权限

Manifest 只声明：

- 显示名称 `X Download`。
- Manifest V3 后台 Service Worker。
- 工具栏 `action`，只配置标题和图标，不配置 `default_popup`。
- `activeTab` 权限，只在用户点击插件后读取当前 Tab 地址。
- 一个仅匹配 `https://x.com/*` 和 `https://www.x.com/*` 的主题 content script，由 WXT 生成 `content_scripts` 配置。

不声明 `tabs`、`storage`、`downloads`、`notifications`、`scripting`、`nativeMessaging` 或任何显式 `host_permissions`。主题 content script 只读取 `prefers-color-scheme`，不读取 X 页面 DOM。

## 帖子地址契约

`post-url.ts` 接收当前 Tab 的可选地址字符串，输出帖子目标或 `null`。

```ts
interface XPostTarget {
  postId: string;
  url: string;
}
```

识别规则：

1. 只接受 `https:` 协议。
2. 只接受 `x.com` 或 `www.x.com` 主机名，输出统一使用 `x.com`。
3. 主路径必须是 `/<account>/status/<postId>`，`postId` 必须全部为数字。
4. 允许 X 帖子详情页附加 `/video/<index>` 或 `/photo/<index>` 媒体尾路径，但输出时删除。
5. 输出时删除查询参数和锚点，统一得到 `https://x.com/<account>/status/<postId>`。
6. 地址缺失、无法解析、主机不符、列表页、缺少 `status` 段或非数字 ID 都返回 `null`。

第一版不根据 DOM 或 X API 验证该帖子是否存在、是否可访问或是否含有视频。

## 运行时数据流

```text
用户打开具体帖子
  → 点击工具栏图标
  → background.ts 收到 action.onClicked
  → 读取当前 Tab URL
  → post-url.ts 返回 XPostTarget 或 null
  → 第一版到此结束
```

主题同步另行独立运行：

```text
打开 x.com 页面
  → theme.content.ts 读取 prefers-color-scheme
  → background.ts 收到合法主题消息
  → browser.action.setIcon 切换黑色或白色图标
```

识别成功后不产生用户可见行为，不写入存储，不发送网络请求。识别失败同样静默结束。这是用户明确选择的第一版边界，不通过额外反馈弥补。

## 图标资源

用户提供的 `/Users/kevin/Downloads/x (1).svg` 是唯一视觉源稿。实施时先将源稿原样纳入 `src/assets/logo/x-download.svg`，再按仓库图标规则生成：

- 黑色默认版：`x-download-16.png`、`x-download-32.png`、`x-download-48.png`、`x-download-128.png`。
- 白色版：`x-download-light-16.png`、`x-download-light-32.png`、`x-download-light-48.png`、`x-download-light-128.png`。

导出只允许裁除多余透明留白、等比缩放和纯色转换。主体保留约 `2px` 安全边距，不重绘、拉伸、增删路径、添加底板或其他效果。

第一版会生成并保留黑白两套资源，并参照 TG Download 的方式，仅在 X 页面通过主题 content script 自动切换工具栏图标。

## 验证设计

### 自动化验证

`post-url.test.ts` 作为地址行为的主要验证层，覆盖：

- 标准单帖地址识别。
- `www.x.com` 规范化。
- 查询参数、锚点和媒体尾路径移除。
- X 列表页、非 X 主机、非 HTTPS、非数字 ID 和缺失地址的拒绝。

`theme.test.ts` 覆盖主题消息、图标路径、主题变化监听和非法消息拒绝。

实施完成后串行执行针对性测试、`tsc --noEmit` 和 `wxt build`。构建产物用于检查 Manifest 版本、权限、Service Worker 入口和图标资源完整性。

### 用户验收

用户在 Chrome 或 Edge 加载 `dist/chrome-mv3`，确认：

- 插件能正常加载，工具栏显示指定 Logo。
- 点击图标不打开 popup、不改变 X 页面、不出现通知。
- 列表页和其他网站上点击同样不产生用户可见副作用。
- 在 X 页面切换系统深浅色主题时，工具栏图标在黑色和白色版本之间切换。

由于第一版故意没有用户可见的识别结果，内部 URL 输出以自动化测试为主要证据，不为了人工验证而增加产品反馈功能。

## 后续 Helper 边界

后续工作项可在 `background.ts` 获得 `XPostTarget` 后增加 Helper 通信，但当前 Spec 不预先定义 Native Messaging 协议、Helper 实现语言、任务队列或 yt-dlp 参数。这些决策属于可独立验收和回滚的后续 Issue。

当前稳定边界只包含：

- 用户明确点击后才产生目标。
- 每次最多产生一个帖子目标。
- 目标只包含规范化链接和帖子 ID。

## 已拒绝的替代方案

- **WXT + React popup**：用户不需要 popup，界面框架只会增加依赖和产物体积。
- **content script 扫描页面**：识别逻辑不读取 DOM；主题 content script 只读取 `prefers-color-scheme`，不产生帖子候选。
- **可见成功或失败提示**：对当前极小中间版本没有用户价值，并非未来 Helper 链路的必要部分。
- **第一版直接接入 Helper**：会同时引入本机安装、Native Messaging 注册、跨进程协议和下载引擎，应作为独立后续交付。

## 非目标

- 不追求在第一版产生可用的下载结果。
- 不支持图片、多视频、引用帖媒体、帖子串或批量任务。
- 不请求 X API，不复用登录 Cookie，不绕过付费、私密或访问控制。
- 不为未来多平台下载建立通用框架。
