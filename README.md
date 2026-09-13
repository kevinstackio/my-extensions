# Browser Extensions

## 项目结构

```text
my-extensions/
├─ apps/                   # 应用项目
│  ├─ extensions/          # Chrome 和 Edge 扩展
│  │  ├─ my-tabs/          # 我的标签页
│  │  └─ tg-download/      # Telegram 资源下载插件
│  ├─ helpers/             # 扩展配套程序
│  └─ website/             # 扩展配套网站
├─ .gitignore              # Git 忽略规则
├─ AGENTS.md               # 项目协作规范
├─ LICENSE                 # 开源许可证
├─ README.md               # 项目说明
├─ package.json            # 根项目配置与统一命令
├─ pnpm-workspace.yaml     # pnpm 工作区配置
└─ turbo.json              # Turborepo 任务配置
```

## My Tabs
我的标签页，保存和组织我喜爱的网站。

## TG Download
在 Telegram Web 中右键保存图片和视频。

## 项目文档

- [Monorepo 使用指南](docs/monorepo.md)
- [WXT 使用指南](docs/wxt.md)
- [扩展迁移到 WXT](docs/migrations/extension-to-wxt.md)
