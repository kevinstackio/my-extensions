# 配置官网手动部署并统一 Actions 名称

## 元信息

- 工作项：2026-10-11-website-manual-pages-deploy
- 项目：website
- 类型：部署配置任务；涉及构建与分发配置，交付边界明确，使用本 Issue 的 Todo 组织实施
- 状态：待验收
- 创建日期：2026-10-11
- 当前阶段：本地阶段已验收且用户已批准本地代码提交；实际 Actions、域名和 HTTPS 仍待用户操作验收
- 用户批准：官网部署到 GitHub Pages 并接入 exts.linguio.dev；两个流程分别命名为 Exts Website Deploy、Exts Release Deploy，独立运行，仅允许 main 手动触发。用户明确要求部署均由本人手动操作，提交代码不自动部署；用户已确认前置设置完成并要求代理继续配置

## 背景

官网已完成页面交付，当前未配置 GitHub Pages 部署。现有发布 Action 名称为 Exts Chrome Release。用户希望统一 Actions 名称，并由本人分别决定官网部署与产品发布的时机。

## 目标

用户可以在 Actions 中从 main 手动部署官网，最终通过 https://exts.linguio.dev/ 访问；产品发布流程独立保留手动打包与 Release 草稿审核。

## 范围

- 新增 Exts Website Deploy，仅使用 workflow_dispatch，仅允许 main 运行，不配置 push、pull_request、定时触发或路径监听。
- 使用仓库精确固定的 Node.js、pnpm 与 Actions 版本，冻结安装、网站类型检查、执行 web:build，并上传根 dist/build/exts-web 的静态产物到 GitHub Pages。
- 检查和构建成功后才执行部署；构建失败保留上一版网站。同一时间只执行一条官网部署流水线。
- 现有产品发布流程显示名称改为 Exts Release Deploy，保留现有手动触发、main 限制、扩展打包和 Release 草稿行为。
- 记录 Pages 发布源、自定义域名、DNS 与 HTTPS 的首次上线操作，以及两个流程的独立手动使用方式。
- 用户本人触发远程部署与发布；代理准备配置并执行必要的本地检查，实际上线结果由用户操作后确认。

## 排除项

- 不修改官网设计、文案、下载行为、产品版本或品牌资源，不升级业务依赖。
- 不新增自动部署、自动公开 Release、macOS 发布包、预览环境或其他部署平台。
- 不代替用户点击运行 workflow，不自动推送、提交代码或修改远程 Pages/DNS 设置；需要代理操作外部设置时另行明确授权。

## Todo

- [x] 确认用户可操作仓库 Pages 设置与 linguio.dev DNS，整理首次上线步骤。
- [x] 新增独立的官网手动部署 workflow，限制 main 并配置必要权限和并发控制。
- [x] 将现有发布 Action 显示名称改为 Exts Release Deploy，保持产品发布行为。
- [x] 同步网站说明，执行配置检查、网站类型检查与一次生产构建，核对部署产物。
- [ ] 展示实际交付、限制和可复现验收步骤，由用户手动部署并确认域名与 HTTPS，停在用户验收。

## 验收标准

- Actions 显示 Exts Website Deploy 与 Exts Release Deploy，两个流程独立手动触发；提交 main 不自动部署。
- 两个流程仅允许 main；产品发布仍生成草稿，不自动公开。
- 官网使用固定工具版本和根产物目录，安装、类型检查或构建失败时不进入部署步骤。
- 用户手动运行官网 workflow 成功，域名通过 HTTPS 可访问，静态资源可加载，原有下载链接保持正确；macOS 暂无附件的已接受限制保留。
- 用户在 Chrome 或 Edge 验收实际页面；代理不执行视觉或交互验收，不把本地构建通过写成远程上线成功。

## 关联文档

- [Commit 记录](../commits/2026-10-11-website-manual-pages-deploy-commit.md)
- [工作台](../README.md)
- [官网说明](../../../apps/website/README.md)
- [构建与分发规范](../../build-release.md)
- [前置发布 Issue](./2026-10-11-exts-fixed-release-assets-issue.md)

## 唯一下一步

用户检查本地配置与验收材料；代码提交并推送后，由用户从 main 手动运行 Exts Website Deploy，确认域名与 HTTPS。未经明确批准不提交或推送，远程验收完成前不结项。

## 本地阶段结果

- 用户确认已完成 Pages/DNS 前置设置；代理未独立核验远程设置。
- 两份 workflow YAML 解析与配置检查通过：仅手动触发、main 限制、完整固定 Actions 版本、部署依赖构建成功、最小部署权限与不取消运行中的并发控制。产品发布流程对比 HEAD 仅显示名称改变。
- 网站类型检查、一次 web:build 通过；现有 tests/build-release.test.mjs 为 17/17 通过。产物 HTML 引用资源存在，无符号链接，两个固定 latest 下载链接正确。
- 未运行远程 Actions、未验证 Linux runner 冻结安装、Pages 环境策略、实际域名或 HTTPS；未执行视觉和交互验收。
