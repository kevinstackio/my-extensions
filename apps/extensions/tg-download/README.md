# TG Download

用于在 Telegram Web 中通过右键菜单保存图片和视频的 Chromium 浏览器扩展。

## 项目结构

```text
tg-download/
├─ public/
│  └─ icon/              # Manifest 与工具栏使用的固定图标
├─ src/
│  ├─ assets/
│  │  └─ icons/          # 组件使用并参与构建的 SVG 图标
│  ├─ components/
│  │  └─ download-menu/  # 下载菜单组件
│  ├─ entrypoints/       # WXT 扩展入口
│  ├─ features/
│  │  └─ download/       # 媒体下载业务逻辑
│  └─ types/             # 项目类型声明
└─ tests/                # 自动化测试
```
