# 配置官网手动部署并统一 Actions 名称：Commit 记录

## 对应 Issue

- [Issue](../issues/2026-10-11-website-manual-pages-deploy-issue.md)

## 预期交付边界

新增官网独立手动 GitHub Pages 部署，统一两个 Actions 显示名称，保持 main 限制与产品发布草稿行为；记录 exts.linguio.dev 首次上线步骤。远程部署由用户本人触发，不增加自动部署或修改页面功能。

## 实际交付

- 新增 Exts Website Deploy，拆分构建与部署 job，仅 main 手动运行，构建成功后才部署根网站产物，同一时间仅运行一条官网部署流水线。
- 产品发布 Action 改名为 Exts Release Deploy，经对比确认其他内容不变。
- 官网说明补充 Pages、DNS、HTTPS 和两个流程的独立手动使用方式。

## 验证结果

- 两份 YAML 解析通过；配置检查确认手动触发、main 限制、精确版本、构建依赖、部署权限与并发控制。
- 网站类型检查、web:build 通过，现有构建边界测试 17/17 通过。
- HTML 引用资源存在、产物无符号链接、两个 latest 下载链接正确。

## 未验证事项与限制

用户确认已完成前置设置，但代理未独立核验。尚未运行远程 Actions，未验证 Linux runner 冻结安装、Pages 环境规则、实际 DNS/HTTPS 和线上资源；无 actionlint 工具，仅执行 YAML 解析与配置检查。未执行浏览器视觉与交互验收。

## 用户验收

本地阶段已验收：用户在看到交付范围、验证结果和完整 message 后明确要求“提交到本地”。远程实际部署、域名与 HTTPS 仍待用户操作验收。

## 最终提交批准

本地代码交付提交已批准：用户明确要求“提交到本地”；不包含推送或远程部署。Issue 保持待验收，远程验收后再结项。

## 最终 Commit message

```text
ci(website): 添加官网手动部署并统一发布流程名称

- 配置仅 main 手动触发的 GitHub Pages 部署
- 将产品发布流程命名为 Exts Release Deploy
- 补充域名配置与手动部署验收步骤
```

## 可复现验收

1. 检查 .github/workflows/exts-website-deploy.yml：只有 workflow_dispatch，build 和 deploy 均限制 main；deploy 依赖 build，产物目录为 dist/build/exts-web。现有发布 workflow 除显示名称外不变。
2. 本地检查：pnpm --filter @exts/website typecheck；pnpm web:build；node --test tests/build-release.test.mjs。
3. 提交并推送批准范围后，在 Actions 确认两个名称；提交本身不应触发部署。运行 Exts Website Deploy，选择 main，确认构建与部署成功。其他分支运行应跳过两个 job。
4. 在 Chrome 或 Edge 打开 https://exts.linguio.dev/，确认 HTTPS、品牌资源与页面内容正常；Chrome/macOS 按钮保持对应固定 latest 链接，macOS 无附件的已接受限制保留。
5. 确认官网部署没有启动产品发布；不要为验收改名而运行 Exts Release Deploy，已有版本的冲突保护仍保留。
