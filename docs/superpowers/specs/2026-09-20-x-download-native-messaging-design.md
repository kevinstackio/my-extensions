# X Download 扩展与 macOS Helper 通信设计

## 元信息

- 工作项：`2026-09-20-x-download-native-messaging`
- 对应 Issue：[`2026-09-20-x-download-native-messaging`](../../changes/issues/2026-09-20-x-download-native-messaging-issue.md)
- 状态：已批准
- 日期：2026-09-20
- 目标平台：Chrome、Edge、macOS 14 及以上
- Organization Identifier：`dev.kevinstack`
- Helper Bundle Identifier：`dev.kevinstack.xdownloadhelper`
- Native Host Bundle Identifier：`dev.kevinstack.xdownloadhelper.nativehost`
- Native Messaging Host Name：`dev.kevinstack.xdownloadhelper.nativehost`

## 用户目标与成功结果

用户先打开一篇具体的 X 帖子，再点击 X Download 工具栏图标。扩展验证当前地址后，将规范化帖子 URL 和帖子 ID 发送给本机 macOS Helper。Helper 未运行时自动启动；成功接收后，任务列表出现一条“已接收”记录并自动展开菜单栏 Popover。

本阶段只证明扩展、Native Host、Helper 和任务列表能够可靠往返通信。成功响应表示任务已进入 Helper 内存，不代表媒体已解析或下载完成。

本 Spec 以既有 X 单帖地址识别契约为输入，保持其解析和规范化规则不变。此前“不显示 Popup、不接 Native Messaging”是上一阶段的交付终点；本工作项从该终点继续扩展，不回写或篡改历史 Spec。

## 已确认的产品行为

- 唯一触发入口是浏览器工具栏图标，不新增右键菜单。
- 点击图标会打开小型插件 Popup，并立即开始当前页面校验和 Helper 连接。
- 成功时 Popup 自动关闭，macOS Helper 的任务列表自动展开。
- Native Host 未注册或无法找到时，Popup 保持打开并显示：

```text
未检测到 X Download Helper

请先安装并启动 Helper，
然后再次点击扩展。
```

- 当前页面不是有效 X 单帖时，Popup 显示：

```text
当前页面不是 X 单篇帖子

请打开需要处理的帖子后重试。
```

- Native Host 已注册但 Helper 启动、连接或响应失败时，Popup 显示：

```text
无法连接 X Download Helper

请确认 Helper 可用后再试。
```

- 安装引导页、安装步骤和“重新检测”明确延后；当前 Popup 不提供相关入口。
- 不使用浏览器系统通知或 macOS 系统通知承载这些状态。

## 架构选择

采用独立 Native Messaging Bridge，将浏览器标准输入输出协议与长期运行的菜单栏 App 解耦。

```text
X 单帖页面
  → Extension Popup
  → Extension Background
  → browser.runtime.sendNativeMessage
  → XDownloadNativeHost 命令行 Bridge
  → 当前用户 Unix Domain Socket
  → X Download Helper
  → DownloadTaskStore
  → MenuBarController 展开 Popover
```

Bridge 是一次性进程：浏览器为每个请求启动它，Bridge 读取一条 Native Messaging 消息、转发给 Helper、写回一条响应后退出。Helper 是独立常驻的菜单栏 App，不跟随 Bridge 或浏览器连接退出。

不让现有 SwiftUI App 直接读取 `stdin/stdout`，避免浏览器进程生命周期、协议输出和菜单栏生命周期互相耦合。Bridge 不持有任务状态，也不实现下载逻辑。

## 组件与职责

### Extension Popup

Popup 使用 WXT 原生 HTML、TypeScript 和少量 CSS，不引入 React 或 UI 组件库。它只负责展示状态并向 Background 发起一次用户操作：

- `checking`：显示“正在连接 X Download Helper…”。
- `invalidPage`：显示当前页面不是 X 单篇帖子。
- `helperMissing`：显示未检测到 Helper 的安装提示。
- `connectionFailed`：显示无法连接 Helper 的通用失败提示。
- `accepted`：立即关闭 Popup，由 Helper Popover 承担成功反馈。

Popup 不直接维护协议细节，不保存任务，不打开安装页面，也不执行重试循环。

### Extension Background

Background 继续复用现有 `parseXPostUrl()` 作为单帖地址的唯一识别边界，并新增一个职责清晰的 Native Messaging Client：

1. 从 Popup 请求中取得当前活动 Tab 地址。
2. 调用 `parseXPostUrl()`，失败时返回 `invalidPage`。
3. 构造版本化 `task.enqueue` 请求。
4. 使用 `browser.runtime.sendNativeMessage()` 执行一次请求响应。
5. 将浏览器连接错误和协议响应映射为 Popup 状态。

Manifest 增加 `nativeMessaging` 权限和 `default_popup`。现有主题消息仍由 Background 处理，通信消息使用独立类型，不混用字段或分支。

### XDownloadNativeHost Bridge

Xcode 工程增加独立 Swift Command Line Tool Target，Bundle Identifier 为 `dev.kevinstack.xdownloadhelper.nativehost`。产物复制到：

```text
X Download Helper.app/Contents/Helpers/x-download-native-host
```

Bridge 的职责只有：

- 从 `stdin` 读取四字节长度前缀和一条 UTF-8 JSON 消息。
- 限制消息大小，拒绝不完整帧和非法 JSON。
- 校验浏览器传入的扩展 Origin。
- 校验协议外壳后连接 Helper 的 Unix Domain Socket。
- Helper 未运行时从自身相对路径定位 App Bundle 并启动 Helper。
- 在限定时间内重试连接，超时后返回结构化错误。
- 将 Helper 响应原样映射为 Native Messaging 响应。
- 只向 `stdout` 写协议帧，所有诊断信息写入 `stderr`。

Bridge 不解析 X 页面、不生成文件名、不修改任务列表、不访问网络或下载目录。

### Helper IPC Server

Helper 启动后创建当前用户专属的 Unix Domain Socket。运行目录位于用户 Application Support 下，并只允许当前用户访问。启动时清理同一路径的失效 Socket；退出时释放监听资源。

IPC Server 负责：

- 读取一条有界 JSON 请求并拒绝额外数据。
- 再次校验协议版本、消息类型、字段和 X 单帖 URL，不信任扩展侧校验结果。
- 将合法任务切换到 Main Actor 后交给 `DownloadTaskStore`。
- 返回新建任务或命中已有任务的成功结果。
- 在响应写完后关闭当前连接。

第一版允许多个 Bridge 依次连接；Store 的写入统一在 Main Actor 串行完成，不增加下载并发模型。

### DownloadTaskStore 与菜单栏

Helper 启动时任务列表默认为空，删除现有三条静态示例任务和五秒模拟下载行为。通信阶段的任务只包含当前显示和去重需要的数据：

- Helper 生成的任务 UUID。
- X `postId`。
- 规范化 `postURL`。
- 状态 `.received`。

同一 Helper 运行周期内，`postId` 是去重键：

- 首次接收创建任务并返回 `created`。
- 重复接收返回已有任务 ID 和 `existing`，不增加新行。
- 两种成功结果都会要求 `MenuBarController` 展开 Popover。

“已接收”任务不显示下载按钮、进度、文件名或下载路径。列表行显示帖子标识、规范化地址或简短状态，并保留移除操作。真实下载阶段再扩展任务状态和媒体字段，不在当前模型中预留虚假进度。

## 协议契约

### 请求

```json
{
  "protocolVersion": 1,
  "requestId": "UUID",
  "type": "task.enqueue",
  "payload": {
    "postId": "123456789",
    "postUrl": "https://x.com/account/status/123456789"
  }
}
```

### 成功响应

```json
{
  "protocolVersion": 1,
  "requestId": "UUID",
  "ok": true,
  "result": {
    "taskId": "UUID",
    "disposition": "created"
  }
}
```

`disposition` 只允许 `created` 或 `existing`。成功仅表示 Helper 已接收，不表示下载成功。

### 错误响应

```json
{
  "protocolVersion": 1,
  "requestId": "UUID",
  "ok": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "请求内容无效"
  }
}
```

第一版固定错误码：

- `INVALID_REQUEST`：JSON、字段、URL 或 `postId` 无效。
- `UNSUPPORTED_PROTOCOL`：协议版本不支持。
- `UNSUPPORTED_MESSAGE`：消息类型不支持。
- `HELPER_START_TIMEOUT`：启动 Helper 后未在限定时间内建立 IPC。
- `HELPER_UNAVAILABLE`：Socket 连接或响应失败。
- `INTERNAL_ERROR`：其他不能安全暴露细节的内部错误。

Native Host 未注册时浏览器无法启动 Bridge，因此该状态来自 `runtime.lastError`，不伪装成 Bridge 返回的协议错误。Popup 将其映射为 `helperMissing`。

## 安全与数据边界

- Native Host Manifest 的 `allowed_origins` 只包含当前开发版扩展 Origin。
- Bridge 同时校验浏览器传入的 Origin，不接受其他扩展调用。
- 扩展和 Helper 都只接受 `https://x.com/<account>/status/<numericId>` 规范化单帖地址。
- Helper 检查 URL 中的帖子 ID 与 `payload.postId` 一致。
- 协议不接受 Shell 命令、可执行路径、下载路径、文件名、Cookie 或任意额外参数。
- Native Messaging 和 Socket 消息都设置小于平台上限的项目级大小限制。
- Socket 目录和文件仅允许当前用户访问，不使用可被其他用户写入的公共固定 Socket。
- 日志不得写入 `stdout`，不得记录 Cookie、认证信息或未来下载凭据。

## 本地开发注册

第一版只支持当前开发者 Mac，不处理对外分发。扩展使用固定开发 Key 保持本地 Extension ID 稳定；该 Key 只用于开发构建，不代表未来 Chrome Web Store 或 Edge Add-ons ID。

Helper 提供独立脚本：

- `install-native-host.sh`：验证 App Bundle、Bridge 可执行文件、绝对路径和开发 Extension ID，然后在 Chrome、Edge 的当前用户 Native Messaging Host 目录写入 Manifest。
- `uninstall-native-host.sh`：只移除本项目 Host Manifest，不删除 App、扩展或其他浏览器配置。

Host Manifest 使用名称 `dev.kevinstack.xdownloadhelper.nativehost`，`path` 指向 App Bundle 内 Bridge 的绝对路径，`type` 为 `stdio`。

Popup 中不展示这些命令或路径。用户在实施验收步骤中由仓库脚本完成本地注册；产品化安装流程另立 Issue。

## 失败处理

- 无效页面：不启动 Bridge 或 Helper，Popup 留在无效页面状态。
- Host 未注册：Popup 显示未检测到 Helper 的确认文案。
- Helper 启动或连接超时：Popup 显示无法连接 Helper，不无限重试。
- 非法协议：Bridge 或 Helper 返回稳定错误码，Popup 显示通用失败提示，具体原因保留在开发日志。
- 重复任务：作为成功结果返回已有任务，不显示错误。
- Popup 被关闭：不取消已经发出的请求；Helper 若已接收，任务仍进入列表。

## 验证设计

### TypeScript 自动化

- 现有 X 单帖地址解析行为继续通过原测试覆盖。
- 覆盖协议请求构造和响应解析。
- 覆盖浏览器 Host 缺失错误、协议错误和成功结果到 Popup 状态的映射。
- 覆盖无效页面不会调用 Native Messaging。
- 不测试 Popup 像素、尺寸、动画、焦点或浏览器内部实现。

### Swift 自动化

- 覆盖 Native Messaging 长度帧的正常、截断、超限和非法 JSON 分支。
- 覆盖协议版本、消息类型、URL 和 `postId` 一致性校验。
- 覆盖 Store 新建、按 `postId` 去重和移除行为。
- 覆盖 Bridge 对 Helper 成功、超时和不可用响应的映射。
- 不启动真实 Chrome、Edge，不自动化菜单栏或 Popover 交互。

### 构建与打包验证

- 扩展类型检查、测试和 WXT 构建通过。
- 生成 Manifest 包含 `nativeMessaging`、固定开发 Key 和 Popup 入口。
- Xcode XCTest、Debug 构建和 App Bundle 配置校验通过。
- App Bundle 内存在可执行 Bridge，Host Manifest 的名称、路径、类型和 Origin 正确。
- 安装与卸载脚本只影响预期的 Chrome、Edge Host Manifest。

### 用户实际验收

用户分别在 Chrome 和 Edge 加载稳定开发产物，并验证：

1. 未安装 Host 时点击插件，Popup 显示确认过的未检测到 Helper 文案。
2. 非 X 单帖页面点击插件，Popup 显示确认过的无效页面文案。
3. 运行本地注册脚本后退出 Helper，在有效 X 单帖页面点击插件。
4. Helper 自动启动，菜单栏出现图标，任务列表自动展开并显示一条“已接收”任务。
5. 再次点击同一帖子，列表不新增重复任务，但 Popover 仍展开。
6. 点击另一篇帖子，列表新增独立任务。
7. 确认没有网络下载、文件写入、系统通知、安装引导页或持久化结果。

## 已拒绝的替代方案

- **菜单栏 App 直接作为 Native Host**：会把浏览器 `stdin/stdout` 生命周期与长期运行 UI 进程耦合，重复连接和浏览器退出行为难以保持清晰。
- **本地文件收件箱**：第一步简单，但实时确认、错误响应和未来任务控制都需要重新建立通信层。
- **localhost HTTP 服务**：需要额外处理端口冲突、鉴权和暴露面，不如 Native Messaging 与用户级 Socket 边界明确。
- **长期 `connectNative` 端口**：当前只需要一次请求响应；长期端口会提前引入 MV3 Service Worker 保活和重连状态机。
- **浏览器通知或页面注入提示**：增加权限或干扰 X 页面，且不符合已确认的小型 Popup 反馈方式。

## 非目标

- 不下载、解析或探测任何 X 媒体。
- 不访问登录态、Cookie、私密帖子、付费内容或受访问控制资源。
- 不决定未来下载目录、命名规则、并发数、重试、断点续传或媒体合并策略。
- 不为 Windows 或生产分发建立抽象层。
- 不为安装引导、自动更新或商店发布预留未使用的界面和代码。
