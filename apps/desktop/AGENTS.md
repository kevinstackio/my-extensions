# desktop 专属规范

遵守根 AGENTS.md。统一产品名和工程名为 exts；正式 Bundle Identifier 为 `dev.linguio.exts`，开发为 `dev.linguio.exts.dev`，Organization Identifier 为 `dev.linguio`。

- src/app 只负责应用生命周期和模块组合；设备媒体业务位于 src/modules/media。
- 只将实际跨模块复用的能力放入 shared，不建未来功能占位或抽象层。
- 测试按 tests/modules 与 tests/scripts 组织，不执行视觉、布局或交互自动化验收。
- 正式版旧媒体下载及缓存路径作为兼容边界保留，不清理或迁移用户文件；开发版使用独立的 Exts Dev 默认目录。配置身份由 project.yml 维护，工程通过 XcodeGen 生成。
- 产品版本只从根 package.json 的 version 获取，经根 scripts/version.mjs 校验；不维护独立桌面版本。应用输出到根 dist/dev/exts-dev.app 或 dist/build/exts.app。
- 图标派生自根 assets/brand 的唯一源稿，不自行重绘。
