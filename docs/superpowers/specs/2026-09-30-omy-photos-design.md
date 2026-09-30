# Omy Photos 设计 Spec

## 元信息

- 日期：2026-09-30
- 状态：已批准
- 产品类型：macOS 自用工具
- 目标系统：macOS 27、iOS 27
- Organization Identifier：`dev.kevinstack`
- Bundle Identifier：`dev.kevinstack.omyphotos`

## 产品目标

Omy Photos 是一个只读的 macOS 原生应用。用户通过 USB 连接并信任一台 iPhone 后，可以浏览 ImageCaptureCore 实际暴露的照片和视频，按拍摄月份选择，并把原始文件安全下载到 Mac。第一版只服务单个用户和当前连接的一台 iPhone，优先低内存、大图库和可靠下载，不替代“照片”App。

## 第一版边界

包含：USB 设备发现与授权引导、照片/视频元数据索引、月份分组、缩略图网格、单项和月份选择、批量与单项下载、默认或自定义下载目录、同名序号、Live Photo 关联下载、增量同步和持久化缩略图。

不包含：大图预览、视频播放、删除或上传、相簿/人物/地点等 Photos 组织结构、Wi-Fi、iPhone App、格式转换、内容去重、永久下载状态、多设备、联网、App Store 发布和旧系统兼容。

## 技术边界与关键决策

- 数据源以 `ICCameraDevice.mediaFiles` 实际枚举结果为准，不调用 iOS `PHPhotoLibrary`，不承诺获取只存在于 iCloud 的原片。
- ImageCaptureCore delegate 只进入设备层，不直接持有或修改 SwiftUI 视图状态；设备层、SQLite 写入、缩略图调度和下载协调器各自串行化内部状态。
- 本地索引使用 `~/Library/Application Support/Omy Photos/library.sqlite`；缩略图使用同目录下的 `Thumbnails/`，不保存原始照片。
- 同步使用代次：只有目录完成回调确认后才清理本轮未出现的旧项目；中断时不执行失效清理。
- 首轮参数为分页 200 条、缩略图最多 4 个并发、活动窗口 80 项、解码缓存 64 MB、停止滚动约 300 ms 后请求。
- 下载使用用户选择的根目录，默认 `~/Downloads/Omy Photos/`；临时文件写入目标目录，成功后原子重命名，永不覆盖现有文件。
- 下载普通项目最多并行 2 个；取消、拔线、锁定或失败删除不完整临时文件，批次继续并提供当前会话重试。
- 不计算 SHA-256，不做内容去重；同一项目重复下载生成新的序号副本。

## 架构边界

```text
OmyPhotosApp
├── Device        设备发现、会话和授权状态
├── Library       媒体模型、索引、月份分组和 SQLite Store
├── Thumbnails    调度、磁盘存储和有界解码缓存
├── Selection     单项与月份三态选择
├── Downloads     队列、文件名、目录权限和临时文件清理
└── UI            连接、网格、月份和下载状态视图
```

## 六个主 Issue

### 1. ImageCaptureCore 技术验证

建立可运行的诊断探针，确认真机上的设备枚举、信任/解锁、目录稳定性、元数据完整性、缩略图、普通照片/视频、Live Photo、RAW/慢动作/超大视频、优化储存空间、锁定、拔线和重连回调。该 Issue 是 Go/No-Go 门槛，不提前承诺完整产品 UI。

### 2. 应用壳与设备会话

建立 Omy Photos macOS App、Bundle 配置和 SwiftUI 状态壳，接入设备发现与授权状态，处理未连接、未信任、锁定、同步中、已连接、拔出和重连状态。

### 3. 本地索引与增量同步

建立 SQLite 媒体模型、稳定排序和月份分组，完成同步代次、增量更新、变化检测、完成后的失效清理和分页查询；不把完整图库载入内存。

### 4. 缩略图与网格浏览

建立持久化缩略图、优先级队列、懒加载网格和有界内存缓存；支持快速滚动占位、停止滚动后的可见区请求和设备索引已有内容的复用。

### 5. 选择与安全下载

加入单项/月份三态选择、总下载和右键单项下载；实现默认/自定义目录、同名序号、原子临时文件、Live Photo 关联文件、并发上限、失败摘要和当前会话重试。

### 6. 稳定性与 MVP 总验收

用合成元数据验证 40 万条分页和选择状态，使用 Instruments 记录内存，覆盖锁定、拔线、权限失效、磁盘空间不足、取消、应用退出和重连；完成最小 MVP 的完整真机验收。第 6 个 Issue 完成后，才把版本称为可长期自用的最小 MVP。

## 分段验收规则

- 一次只保留一个活动 Issue；前一 Issue 的最终 Git Commit 成功后才能开始下一 Issue。
- 每个 Issue 先完成对应自动化验证，再停在用户验收；验收通过后才更新终态并提交。
- 代理可自行验收纯逻辑、SQLite、调度、文件命名、构建、压力测试和文档一致性。
- 用户必须在真实 Mac+iPhone 上验收信任、媒体暴露、滚动、拔线、空间和下载结果；自动化通过不等同于用户验收。
- 第 1 个 Issue 若发现 ImageCaptureCore 无法满足核心需求，停止后续实现并回到方案评估；第 6 个 Issue 未完成，不宣称稳定 MVP。

## 关联来源

- 外部设计稿：`/Users/kevin/Documents/Codex/2026-09-30/ru-guo/outputs/2026-09-30-omy-photos-design.md`
- 后续实施 Plan：`docs/superpowers/plans/2026-09-30-omy-photos-mvp.md`
