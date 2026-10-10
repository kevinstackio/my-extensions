# 整理 V3 图标与插头 Logo 独立规范：Commit 记录

## 对应 Issue

- [Issue](../issues/2026-10-10-repo-ohmy-icon-system-docs-issue.md)

## 预期交付边界

将 V3 个性化图标规范与现有插头 Logo 规范分别保存到 docs，整理原入口与管理记录；不修改图标资源或外部页面。

## 实际交付

- docs/ohmy-icon-system.md 以 V3 替换 V2：普通个性化图标采用 extension、bookmark、download、photos 语义名，一份手绘单色 SVG 由使用方控制主题颜色。
- 明确以 Simple Icons 原图为参考手绘并调整细节，统一视觉大小、颜色与绘制风格；外框由用户逐图确认，不按品牌身份决定。
- 同步 apps/extension/AGENTS.md，允许以 Simple Icons 原图为手绘参考；正式交付统一为一份 1024 坐标 currentColor SVG，无固定宽高或独立 24×24 接入版。未确认的图标不自动重绘或替换。
- 记录 GitHub、Notion、YouTube 首批样本均无框，圆润饱满风格尚待实际绘制验收。
- docs/exts-logo.md 独立保存插头 Logo 的既有规则，明确与图标库的职责边界，并按构建规范整理验收产物路径。
- assets/brand/GENERATION.md 保留跳转入口；资源 README 的规范链接与已批准主体版本同步。
- 同步 Issue、Commit 记录与工作台入口；现有图标和代码不变。

## 验证结果

- 八份相关文档 UTF-8 解码成功，140 个本地链接目标存在。
- V3 的 13 节、语义名称、currentColor 和旧双版本规则清理检查通过；既有外框与四图案登记尺寸保留。
- Logo 的主体基准、固定黑底白色、正式导出哈希流程及根 dist 产物路径检查通过。
- 逐图外框与参考手绘规则核对通过；V3 及扩展规范不再保留品牌一律无框、有现成 SVG 就不能手绘的限制。
- 最终一份 1024 坐标 SVG、currentColor 及首批无框样本规则核对通过；V3 与扩展规范不再要求 24×24 独立接入版本。
- git diff --check 通过；工作区仅有本工作项八份文档变更。

## 未验证事项与限制

- 本次只整理文档，未运行应用构建或图标视觉验收。
- 用户手绘图标尚未提供，尚未生成或上传 Iconfont；现有图标资源不变。
- 用户已验收并批准本地提交；不推送远端。

## 用户验收

已通过：用户于 2026-10-10 确认已展示文档交付并批准本地提交。

## 最终提交批准

已批准：用户同意已展示的八份文档、完整 Commit message 与结项字段更新。

## 最终 Commit message

拟用，待用户审核与批准：

```text
docs(repo): 整理 V3 图标与插头 Logo 独立规范

- 明确语义命名与单一手绘 SVG 主题规则
- 分离插头 Logo 规范并整理文档入口
```
