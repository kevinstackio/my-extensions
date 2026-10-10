# 重建 Exts 产品官网：Commit 记录

## 对应 Issue

- [Issue](../issues/2026-10-11-website-product-homepage-issue.md)

## 预期交付边界

完整替换网站 VitePress 实现，建立明确职责的 React 工程与已确认的产品首页；接入 shadcn、静态品牌资源和按根产品版本生成的 Chrome/macOS 下载直链。保留现有根命令与产物规范，不包含部署、DNS 或其他应用修改。

## 实际交付

- 使用 Vite、React、TypeScript、Tailwind 和 shadcn Radix Button 完整替换网站 VitePress 实现；应用入口、首页、布局、基础 UI、资源、配置和下载功能按职责组织。
- 首页按已认可的布局显示 Exts、GitHub 图标、两行标语、静态正式 logo、Chrome/macOS 平台按钮与 © 2026 Lin Gui；macOS 在前、Chrome 在后，均为相同黑底白字按钮和白色图标；两个入口都可点击，不添加即将推出、Powered by 或网址。
- 构建时读取并校验根 package.json 的 version，再注入网站生成对应 v<版本> 的 ZIP/DMG 直链。按用户最新要求移除 API、请求、加载状态、预检与结果提示，macOS 同时开放。
- 使用用户提供的单色 Chrome/Apple SVG、既有 GitHub SVG 与正式品牌资源；shadcn Button 手工接入官方 registry 源码，只替换为本地 cn 工具导入，未运行 CLI 或新增 cn 依赖。
- 固定批准的依赖版本，移除 VitePress 独占依赖；保留根 web:dev、web:build、网站产物与缓存规范，并同步文档和第三方许可文本。

## 验证结果

- 正常安装使用 pnpm 12.4.2 完成，extension postinstall 的 wxt prepare 正常执行；阶段冻结安装通过，未使用忽略脚本或其他绕过措施。
- 最终版本已删除不再使用的 API 与对应测试，并移除网站 Vitest 依赖。简单直链不新增镜像测试，使用实际构建产物核对根版本注入和两个地址。
- 网站 TypeScript --noEmit 通过，根 pnpm web:build 入口成功；产物为 dist/build/exts-web，JS 258.17 kB（gzip 81.52 kB）、CSS 17.10 kB（gzip 4.07 kB）。
- node --test tests/build-release.test.mjs：13/13 通过，未运行无关扩展或桌面全量构建。
- 锁文件只更新 apps/website importer，移除 81 个不再需要的 package/snapshot 条目；其余 importer、保留依赖对象与 pnpm 包管理器锁文档一致。
- 用户 SVG 与 Downloads 原文件逐字节一致，public 品牌资源与根正式网站资源逐字节一致；构建 index.html 引用的全部本地资源及许可声明存在，旧网站 apps/docs 路径未残留在新产物。
- 用户要求两个黑色按钮一致且 macOS 在前后，生产构建再次通过；此轮只改变样式和顺序，未新增测试或重复无关验证。
- git diff --check 通过；按 React 组件职责、状态、访问名称与真实按钮/链接语义进行代码自查，遵循仓库禁止子代理规则，未声称独立审查或浏览器验收完成。

## 未验证事项与限制

当前根版本 1.0.0 的 Chrome ZIP 地址经 HTTP HEAD 检查返回 200，Content-Type 为 application/octet-stream，大小 227279 字节；此检查不等于浏览器成功下载或安装。用户明确知道 macOS DMG 当前不存在，仍批准开放该版本直链。页面按用户要求不判断下载结果。

页面视觉、窄屏布局、键盘/焦点/指针与实际安装由用户在 Chrome 验收。页面主体依赖 JavaScript，禁用 JavaScript 时 HTML 提供 Releases 替代链接。根 GitHub Pages、DNS 和 HTTPS 尚未部署，属于后续独立 Issue。

本机 Volta 全局 pnpm 为 12.4.1，根配置要求 12.4.2；普通入口曾因版本接管无输出。此次下载并校验官方 12.4.2 原生包到 /private/tmp/exts-website-tools，使用该包与固定 Node 24.16.0 完成正常安装和验证，未改变全局安装或版本配置。

## 可复现验收

1. 仓库根运行 pnpm web:dev，在 Chrome 打开命令输出的地址。若本机 Volta pnpm 仍无输出，可在当前机器使用已验证的临时入口：env PATH=/private/tmp/exts-website-tools:/Users/kevin/.volta/tools/image/node/24.16.0/bin:/usr/bin:/bin:/usr/sbin:/sbin /private/tmp/exts-website-tools/pnpm web:dev；临时目录可能在系统清理后失效，此时需重新准备仓库指定的 pnpm 12.4.2，不能改成浮动版本。
2. 确认左上为 Exts、右上只有 GitHub 图标；正文为两行标语，右侧为静态现有 logo；底部只有 © 2026 Lin Gui。
3. 确认下载按钮顺序为 macOS、Chrome；两者同为黑底白字，图标为白色 Apple/Chrome；均为可点击链接，没有禁用、即将推出或下载状态提示。
4. 点击 GitHub 图标应进入 https://github.com/linguio/exts；Chrome 与 macOS 按钮都可点击，对应根版本的 ZIP/DMG 直链。当前版本 1.0.0；Chrome 链接为 https://github.com/linguio/exts/releases/download/v1.0.0/exts-chrome-1.0.0.zip，macOS 链接为同目录 exts-mac-1.0.0.dmg。
5. 点击后由浏览器直接访问附件地址，不先请求 api.github.com；页面不显示下载成功或失败。macOS 附件当前不存在是已批准状态，不作为本次验收失败条件。
6. 解压下载 ZIP，在 chrome://extensions 开启开发者模式并选择“加载已解压的扩展程序”，确认文件为预期扩展。此项不把 ZIP 下载等同于成功安装。
7. 调整 Chrome 窗口至窄屏，确认内容重排且可读；实际布局与交互由用户判断，不由自动化测试代替。

## 用户验收

已通过：用户于 2026-10-11 在阶段交付及按钮样式、顺序调整后表示“可以了”，并要求拆分 Commit。代理未独立执行浏览器视觉或交互验收。

## 最终交付状态

已完成；本记录、Issue 与工作台终态随最终交付 Commit 一并提交，不保存 Commit SHA。提交失败时恢复待提交与待批准。

## 最终提交批准

已批准：用户于 2026-10-11 确认两次本地 Commit 的拆分范围与标题；执行前已展示完整正文。用户随后明确要求“提交到本地”；批准包括最终交付提交前将 Issue、Commit 记录与工作台结项的机械性更新，不包含推送、部署或开始第二个 Issue。

## 最终 Commit message

本记录仅对应第二次最终交付 Commit；第一次为独立批准的规划文档 Commit，不保存其 SHA。用户已批准本地提交：

```text
feat(website): 重建 Exts 产品官网与平台下载入口

- 使用 React 与 shadcn 替换 VitePress 并明确网站模块职责
- 按根产品版本生成 Chrome 与 macOS 下载直链
- 固定依赖版本并同步构建说明、验证与验收记录
```
