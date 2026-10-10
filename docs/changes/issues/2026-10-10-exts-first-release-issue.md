# 建立扩展发布并验证首版打包

## 元信息

- 状态：实施中
- 工作项：2026-10-10-exts-first-release
- 用户批准：用户批准附件命名为 exts-chrome-<版本>.zip、exts-mac-<版本>.dmg，创建本 Issue 并开始构建、打包与首个 Tag 流程。
- 当前阶段：本地实现与自动化验证完成，用户已通过明确本地提交请求确认本地阶段验收并批准单个实现提交；推送和远程发布未执行。

## 背景

首版只发布统一扩展，官网替换另开后续 Issue。旧 OhMy DL workflow 已归档，根 release 强制构建三端，无法独立交付扩展。

## 目标

交付可独立运行的扩展构建与打包入口，建立 GitHub Actions，并最终获得 v1.0.0 Tag、首版 ZIP 和经过实际核实的公开下载地址。

## 范围

- 根发布脚本、命令、相应行为测试和构建规范。
- .github/workflows 下的手动扩展发布流程；版本只读取根 package.json。
- 先验证再创建指向实际构建提交的 v<版本> Tag 与 Release 草稿，上传 exts-chrome-<版本>.zip。
- 现有完整发布入口的附件名同步为 exts-chrome / exts-mac，不改变桌面构建行为。
- 用户验收与提交批准后推送、运行 Action；核实草稿包，公开首版并核实下载地址。

## 排除项

- 不修改扩展功能、图标、依赖版本、官网或桌面功能，不发布 DMG。
- 不发布 Chrome / Edge 商店，不改写已有 Tag，不覆盖正式 Release 附件。
- 不执行代理浏览器视觉和交互验收，不自动提交或推送。

## Todo

- [x] 增加独立扩展打包入口并覆盖真实 ZIP、版本校验及冲突保护。
- [x] 配置手动 Action，完成扩展检查、打包及 Tag / 草稿保护；远程行为待运行验证。
- [x] 执行一次完整本地验证，记录 ZIP、结果和限制，交付用户验收。
- [ ] 用户确认后完成本地最终提交，取得推送授权并运行 Action。
- [ ] 核实 Action ZIP 与 Tag 指向，公开首版并验证真实下载地址。

## 验收标准

- pnpm ext:release 在 Windows 本地及 Linux CI 只构建扩展；ZIP 根层包含 manifest.json，版本与根版本相同。
- 无效产物和同版本冲突拒绝发布；失败不覆盖已有文件。
- Action 测试、类型检查、构建和体积检查通过后才创建 Tag / 草稿。
- v1.0.0 指向实际构建提交；失败不报告正式发布成功，正式 Release 不允许覆盖。
- 用户下载 Action ZIP，解压加载到 Chrome / Edge；新标签页、书签、Dock、标签组行为符合现有功能。
- 公开后实际下载 exts-chrome-1.0.0.zip 成功；源码 ZIP 不作为扩展安装包。

## 关联文档

- [Commit 记录](../commits/2026-10-10-exts-first-release-commit.md)
- [构建与分发规范](../../build-release.md)

## 唯一下一步

恢复 GitHub 访问并取得推送授权，再运行 Action 验证首版 Tag 与 Release。用户已批准先以单个本地 Commit 提交发布实现、保持 Issue 开放的流程例外；远程验收后再补最终记录，不开始下一 Issue。
