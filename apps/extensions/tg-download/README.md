# TG Download

用于在 Telegram Web 中通过右键菜单保存图片和视频的 Chromium 浏览器扩展。

## 项目结构

```text
tg-download/
├─ src/
│  ├─ assets/
│  │  ├─ icons/          # 下载按钮使用的 SVG 图标
│  │  └─ logo/           # Manifest 与工具栏使用的品牌图标
│  ├─ components/
│  │  └─ download-menu/  # 下载菜单组件
│  ├─ entrypoints/       # WXT 扩展入口
│  ├─ features/
│  │  └─ download/       # 媒体下载业务逻辑
│  └─ types/             # 项目类型声明
└─ tests/                # 自动化测试
```

## 开发和验证

在仓库根目录执行：

```bash
pnpm tg:dev
pnpm tg:build
```

`pnpm tg:dev` 保持 WXT 的原有开发命令不变。WXT 的临时开发产物位于 `dist/chrome-mv3-dev/`，公共稳定发布工具会在构建成功后自动更新 `dist/chrome-mv3-dev-stable/`。浏览器开发时必须加载后者，生产验收才加载 `dist/chrome-mv3/`。

如果开发构建失败，稳定目录会继续保留最近一次成功构建，浏览器无需重新加载损坏的半成品。修复代码后重新构建成功，稳定目录会一次性更新为新的完整版本。

## 浏览器加载

1. 在 Chrome 或 Edge 打开扩展管理页面并启用开发者模式。
2. 选择“加载已解压的扩展程序”。
3. 开发验证选择 `apps/extensions/tg-download/dist/chrome-mv3-dev-stable/`。
4. 生产验证选择 `apps/extensions/tg-download/dist/chrome-mv3/`。
5. 修改入口或 Manifest 后，确认 WXT 构建成功，再在扩展管理页面重新加载扩展。
