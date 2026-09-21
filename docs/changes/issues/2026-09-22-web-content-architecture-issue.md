# 完善 My Extensions 品牌定位与内容入口

## 元信息

- 工作项：`2026-09-22-web-content-architecture`
- 项目：`web`
- 类型：小型任务
- 状态：已完成
- 当前阶段：实现、构建验证、用户验收和 Git 提交均已完成
- 创建日期：2026-09-22
- 最近更新：2026-09-22

## 背景

现有官网将 `My Extensions` 描述为“浏览器扩展的统一官网与文档中心”，无法覆盖仓库未来承载的原生应用、AI Skills 和 npm Packages，也没有表达“将个人想法与能力向外延伸”的品牌含义。当前首页、导航和示例页面仍保留 VitePress 初始化内容，需要建立正式但克制的内容入口。

## 目标

将 `My Extensions` 明确为个人数字能力与实用工具的统一品牌，在同一个官网中区分 Apps、Toolkits 和 Docs，同时保持仓库按技术职责组织，不额外创建 `toolkits` 目录或独立网站项目。

## 范围

- 将首页品牌层级调整为：`My Extensions`、`我的数字能力延伸`，以及说明浏览器扩展、应用、AI Skills 与开发工具的简介。
- 将现有 Markdown Examples 页面替换为 Apps 入口，承载浏览器扩展和应用类产品。
- 将现有 API Examples 页面替换为 Docs 入口，作为各产品和工具文档的统一入口。
- 在网站信息架构中增加 Toolkits 分类，下分 AI Skills 与 npm Packages。
- 保持仓库中的 `apps/` 和 `packages/` 现有层级，在根目录新增 `skills/README.md` 说明 Skills 的定位和收录边界。
- 同步网站导航、站点描述以及受本次目录职责变化影响的仓库说明。

## 排除项

- 不创建实体 `toolkits/` 目录。
- 不把 `apps/extensions`、`apps/helpers` 或 `apps/web` 提升到仓库根目录。
- 不创建第二个官网、独立文档站或新的部署项目。
- 不在本次创建具体 AI Skill 或新的 npm Package。
- 不自定义 VitePress 主题、Logo、插画或额外视觉效果。
- 不配置搜索、统计、域名、CI 或部署。

## Todo

- [x] 更新首页品牌文案和入口按钮。
- [x] 将两个 VitePress 示例页面改为 Apps 与 Docs 正式入口。
- [x] 配置 Apps、Toolkits、Docs 的导航关系和基础内容层级。
- [x] 新增根目录 `skills/README.md`，说明 AI Skills 的职责与收录方式。
- [x] 同步站点描述及相关仓库结构文档。
- [x] 完成构建验证并交由用户进行页面内容与导航验收。

## 验收标准

- 首页能够清楚表达 `My Extensions` 不只代表浏览器扩展，也代表个人数字能力的延伸。
- 首页提供可识别的应用入口和文档入口，不再出现 VitePress 的 Markdown/API 示例文案。
- 网站能够区分 Apps、Toolkits 和 Docs；Toolkits 下明确包含 AI Skills 与 npm Packages。
- 仓库继续使用根目录 `apps/`、`packages/`、`skills/`，不存在 `toolkits/` 目录。
- `skills/README.md` 能说明该目录收录什么、不收录什么，以及它与 `packages/` 的区别。
- VitePress 生产构建成功，页面不存在失效的内部导航链接。
- 用户在浏览器中确认首页文案、入口关系和导航层级符合预期。

## 关联文档

- [Commit 记录](../commits/2026-09-22-web-content-architecture-commit.md)

## 唯一下一步

无。工作项已由提交 `67472d0` 完结。
