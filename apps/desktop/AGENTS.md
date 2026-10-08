# desktop 专属规范

遵守根 AGENTS.md。统一产品名和工程名为 exts；Bundle Identifier 使用用户指定的 `dev.linguio.exts`，Organization Identifier 为 `dev.linguio`。

- src/app 只负责应用生命周期和模块组合；设备媒体业务位于 src/modules/media。
- 只将实际跨模块复用的能力放入 shared，不建未来功能占位或抽象层。
- 测试按 tests/modules 与 tests/scripts 组织，不执行视觉、布局或交互自动化验收。
- 旧媒体下载及缓存路径作为兼容边界保留，不因改名清理或迁移用户文件。
- 图标派生自根 assets/brand 的唯一源稿，不自行重绘。
