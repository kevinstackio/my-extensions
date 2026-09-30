# OmyTabs

## 1. 介绍

OmyTabs 是一个基于 Chromium 新标签页的浏览器扩展，用于保存和组织常用网站、书签和工具入口。

## 2. 项目框架

- 使用 WXT、React、TypeScript 和 Tailwind CSS v4。
- 使用 shadcn/ui 与 Radix 原语构建 DropdownMenu、Tooltip、Dock 等界面组件。
- 新标签页入口位于 `src/entrypoints/newtab/`。
- 书签、标签组和浏览器交互逻辑位于 `src/types/`、`src/constants/` 与 `src/utils/`。
- 根目录开发命令：`pnpm omytabs:dev`。

## 3. 本目录项目结构

```text
omytabs/
├─ src/
│  ├─ assets/                    # 书签、工具和扩展图标资源
│  ├─ components/                # UI 原语与共享组件
│  ├─ entrypoints/               # WXT 入口
│  ├─ lib/                       # UI 共用工具
│  ├─ styles/                    # Tailwind、主题和全局样式
│  ├─ types/                     # 书签领域类型
│  ├─ utils/                     # 浏览器 API 与通用工具
│  └─ views/                     # 新标签页视图
├─ scripts/                      # 构建与包体积检查脚本
├─ tests/                        # 自动化测试配置与测试文件
├─ package.json                  # 项目命令与依赖
└─ wxt.config.ts                 # WXT 配置
```
