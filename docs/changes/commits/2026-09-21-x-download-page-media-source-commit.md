# 让 X Download 使用页面媒体源下载视频：交付记录

## 元信息

- 工作项：`2026-09-21-x-download-page-media-source`
- 对应 Issue：[让 X Download 使用页面媒体源下载视频](../issues/2026-09-21-x-download-page-media-source-issue.md)
- 状态：待验收
- 用户验收：未开始
- 最终提交批准：未申请
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 预期交付边界

- 扩展从当前已登录 X 页面取得完整视频来源，不读取或传递 Cookie。
- Native Messaging 请求增加经过清洗的媒体来源，同时兼容现有地址请求。
- Helper 校验媒体来源并复用现有队列和工具链直接下载。
- 以目标帖子未播放即可下载作为主路径验收，不处理图片、孤立分片或失败恢复扩展功能。

## 实际完成内容

- 扩展主世界观察 X API 响应副本，隔离桥按当前帖子校验并缓存完整 HLS、DASH、MP4 来源。
- Native Messaging 升级到 v2，传递 `mediaSources`，并保留 v1 地址请求兼容与空来源降级。
- Helper 和 Native Host 增加来源模型、严格域名/格式校验、失败任务原位刷新及直链串行下载；有来源时跳过帖子解析。

## 验证结果

- 扩展：`node_modules/.bin/vitest run`，8 个测试文件、42 个测试通过。
- 扩展：`node_modules/.bin/tsc --noEmit` 通过；`node_modules/.bin/wxt build` 通过，产物为 `apps/extensions/x-download/dist/chrome-mv3`。
- Helper：`xcodebuild ... test`，41 个测试、0 失败；`scripts/build.sh` 构建成功；`scripts/verify_app_bundle.sh` 验证固定版本 yt-dlp/FFmpeg 成功。
- `git diff --check` 通过；敏感边界检查仅保留 `.m4s` 拒绝规则，没有 Cookie、Authorization 或新增 Header 传递。

## 未验证事项与限制

- 尚未进行 Chrome/Edge 实际点击验收；按用户要求跳过独立捕获探针，首次实际点击可能走媒体来源直链或地址解析降级。
- 当前构建未签名/未公证，仅用于本机开发验收。

## 用户验收

- 结果：等待用户验收
- 说明：请直接加载扩展并运行 Helper，看目标帖子是否下载到桌面；连续点击应保持单任务，失败时 Helper 行内可复制完整错误。

## 最终 Commit message

feat(x-download): 接入页面媒体来源直链下载

- 扩展提取并传递当前帖子完整视频来源
- Helper 校验来源并跳过失败的帖子解析
- 保留队列去重、串行下载和完整错误反馈

## 最终提交批准

- 状态：未申请
- 说明：用户验收通过后单独申请。
