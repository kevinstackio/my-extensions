# 建立 exts 应用结构并迁入首批功能实施 Plan

依据：[Issue](../../changes/issues/2026-10-08-repo-app-foundations-root-commands-issue.md)与[设计记录](../specs/2026-10-08-repo-app-foundations-root-commands-design.md)。用户于 2026-10-09 要求开始，批准串行实施；禁止子代理，提交批准以用户最终明确要求为准，不推送。

## 边界

使用现有 dev 工作区，保留已确认图标材料；不新建 worktree。统一 exts、@exts/* 与 dev.linguio.exts，归档及已有用户数据不改，不升级依赖。不引入未来模块占位、框架、假 DOM 或视觉／交互自动化。

## 1. 名称与模块结构

- [x] 保留首批媒体与新标签页行为，整理 desktop app／modules/media／resources 和 extension entrypoints／app／modules/newtab／shared。
- [x] 迁移对应行为测试及必要配置测试，更新导入、资源引用、Xcode 配置、内部包和现行说明。
- [x] 生成 exts.xcodeproj 后退役旧工程，保留旧下载与缓存路径。

## 2. 图标与根命令

- [x] 从唯一源稿派生并接入 AppIcon、透明插件黑白 PNG、VitePress 浅深 SVG／favicon／touch。
- [x] 核对 web／ext／desk 六个命令，desk 保留 Node 平台和工具检查；不新增 watcher、Icon Composer 构建体系或 PWA。

## 3. 安装与自动化验证

- [x] 复现 frozen 安装原生包缺失，固定 pnpm 12.4.2 修复锁记录；正常安装、prepare 与 frozen 安装通过，原版本保留。
- [x] 扩展 15 项、公共工具 7 项、desk 入口 8 项通过；扩展类型、生产构建、体积和官网构建通过。
- [x] 一次 WXT 内部 serve 构建验证真实稳定 hook 发布，不启动浏览器／server；核对生产和稳定 Manifest／资源。
- [x] Release 构建通过，Debug 由 XCTest 构建验证；XCTest 25／27，通过项和两项既有 SQLite 失败完整记录，不重复重试或扩业务修复。
- [x] 核对产物身份、AppIcon、锁版本、归档无 diff 和最终文档。

## 停止点

交付用户验收：真实三端图标、浏览器核心流程及成功→失败→恢复加载、Mac＋iPhone 和数据保留。SQLite 分页缺陷当前未接入 UI，保留工作台后续事项；原生闭包／并发警告不擅自修复。用户于 2026-10-09 明确要求拆分提交本地，验收与最终批准已取得；按用户最后明确要求拆为四份：安装 fix、desktop、extension、官网／仓库收口，提交成功后完成，不推送。
