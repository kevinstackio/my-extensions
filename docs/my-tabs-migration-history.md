# My Tabs 迁移历程与下一阶段计划

本文记录 My Tabs 从独立原生扩展到 monorepo、WXT、React，再到第一阶段全局 UI 升级的完整过程，并定义下一阶段 shadcn/ui 深度重构的边界和验收方式。

## 文档状态

- 记录时间：2026-09-16
- 当前项目：`apps/extensions/my-tabs`
- 当前状态：第一阶段 UI 设计系统和组件视觉迁移已完成；下一阶段 shadcn/ui 深度重构仅完成规划，尚未开始。
- 对应 Linear：KEV-145 至 KEV-156 已按用户要求关闭；KEV-157 作为下一阶段规划保留在 Backlog。

## 一、原生扩展阶段

My Tabs 最初是独立的 Chromium 新标签页扩展，使用原生 HTML、CSS 和 JavaScript 实现，主要能力包括：

- 书签卡片和书签列表
- 文件夹网格与四宫格预览
- EDU 文件夹遮罩
- 底部 Dock 和工具菜单
- Popover、Hover、点击、Escape 和焦点恢复
- 书签打开与文件夹标签组打开
- 品牌 SVG、工具 SVG 和扩展 Logo
- 系统明暗主题

这个阶段功能直接、运行路径短，但页面结构、状态、样式和浏览器 API 之间耦合较高，扩展构建和后续视觉升级不容易形成统一边界。

## 二、迁移到 monorepo

随后将 My Tabs 纳入 `my-extensions` monorepo，并建立独立的扩展目录：

```text
my-extensions/
├─ apps/extensions/my-tabs/
├─ packages/stable-extension-dev/
├─ docs/
└─ pnpm-workspace.yaml
```

这一阶段的主要结果：

- 使用 pnpm workspace 管理多个扩展和共享包。
- My Tabs 拥有独立的 `package.json`、构建、测试和资源目录。
- Node.js、pnpm、WXT、Tailwind、TypeScript 和第三方依赖使用精确版本。
- 共享稳定开发产物工具，避免各扩展重复实现发布保护逻辑。
- 开始统一自动化测试、构建检查和包体积预算。

相关文档：[monorepo 使用指南](monorepo.md)。

## 三、迁移到 WXT

构建体系从手动维护扩展目录迁移到 WXT：

- 使用 WXT 管理 Manifest V3、入口发现和开发监听。
- 新标签页入口迁移到 `src/entrypoints/newtab/`。
- 通过 `@wxt-dev/module-react` 接入 React。
- 在 `wxt.config.ts` 中接入 `createStableDevelopmentHooks()`。
- 开发浏览器只加载 `dist/chrome-mv3-dev-stable/`。
- WXT 构建成功后才更新稳定目录；失败时保留上一份成功产物。
- 生产构建目录为 `dist/chrome-mv3/`。

WXT 只负责扩展入口、Manifest、监听和构建；页面视图层由 React 负责。这样既保留了扩展运行所需的稳定发布机制，又避免把 WXT 和 UI 框架混成一层。

相关入口：[wxt.config.ts](../apps/extensions/my-tabs/wxt.config.ts)。

## 四、React 化

在 WXT 基础上，页面视图从原生 DOM 逐步迁移到 React，形成了按职责拆分的组件和视图结构：

```text
apps/extensions/my-tabs/src/
├─ components/
│  ├─ bookmark-card/
│  ├─ bookmark-folder/
│  ├─ bookmark-list/
│  ├─ popover/
│  └─ ui/
├─ entrypoints/newtab/
├─ styles/
├─ types/
├─ utils/
├─ views/bookmarks/
└─ test/
```

迁移重点不是改变产品行为，而是把已有行为变成可测试、可组合的 React 组件：

- `BookmarkCard` 负责单个书签的图标、文字、状态和打开行为。
- `BookmarkList` 负责列表和链接语义。
- `BookmarkFolder` 负责文件夹预览、遮罩和标签组打开。
- `bookmark-dock.tsx` 负责 Dock 工具入口和菜单触发器。
- `Popover` 保留现有交互契约，统一视觉但暂不替换底层实现。
- 共享类型和浏览器 API 工具从视图中抽离。

迁移过程中没有新增搜索、编辑、拖拽、设置或主题按钮等产品功能。

## 五、第一阶段全局 UI 升级

这一阶段的目标是先建立统一设计系统，再迁移现有组件视觉，而不是一次性重写所有组件。

### 5.1 技术基础

- Tailwind CSS v4
- shadcn/ui 配置和 CSS Variables
- `components.json` 统一组件别名和 Token 入口
- Geist Sans 本地字体
- `prefers-color-scheme` 系统明暗主题
- `prefers-reduced-motion` 动效降级
- Tailwind 语义类替代散落的产品颜色

唯一的 Tailwind 和主题入口是 [src/styles/index.css](../apps/extensions/my-tabs/src/styles/index.css)。

### 5.2 Design Tokens

全局 Token 使用 shadcn 语义命名，并将 My Tabs 需要的一致性变量集中声明：

- `background` / `foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `primary` / `primary-foreground`
- `border` / `border-strong`
- `ring`
- `surface-raised` / `overlay`
- `radius`、阴影、动效时长和缓动函数
- 图标瓦片尺寸和图标字形尺寸

这样做的目的，是让全局一致性变量只有一个来源，避免每个业务组件自行声明相似颜色，造成后续漂移。

### 5.3 字体

引入本地 Geist Sans Variable：

- 仅保留一个 WOFF2 字体产物。
- `font-display: swap`，避免字体阻塞首帧。
- 中文使用系统字体回退。
- 字体大小约 69KB，并纳入包体积预算。

### 5.4 SVG 和主题

- 品牌 SVG 保留用户原始图案和品牌色。
- 单色功能图标只有在明确标记为 `adaptive` 时才进行黑白主题转换。
- 深色主题使用滤镜转换为浅色，不复制第二套 SVG，也不重绘图案。
- 图标尺寸、边框、焦点环和主题前景色由组件契约统一控制。

### 5.5 Dock、Popover 和交互边界

Dock 工具图标统一使用 `border-border` 的默认边框；Hover、Focus 和 `aria-expanded` 状态只改变背景，不额外改变边框，避免与其他标签产生不一致。

Popover 暂时保留现有实现，原因是它已经覆盖：

- Hover 打开和离开延迟
- 点击打开
- 外部点击关闭
- Escape 关闭
- 焦点恢复
- placement 和箭头控制

当前只迁移 Popover 的 Token、定位样式和行为测试，不同时维护第二套 Radix Popover 实现。决策记录见 [popover-migration-decision.md](../apps/extensions/my-tabs/docs/popover-migration-decision.md)。

## 六、当前验证结果

第一阶段已完成：

- 15 个测试文件、58/58 测试通过。
- TypeScript 检查通过。
- WXT 生产构建通过。
- JS、CSS、字体和完整产物体积预算通过。
- 明暗主题、SVG 自适应色、Dock、Popover、遮罩和 Focus 视觉验证完成。
- `100%`、`125%`、`150%` 和 `200%` 视口检查完成。
- `640×360` CSS 视口无横向溢出；纵向滚动属于内容超出视口后的正常滚动。
- Reduced Motion 下 transition 和 animation 压缩到接近零时长。
- Google Translate 标签使用 `white-space: nowrap`，避免换行破坏 Dock Popover。

当前包体积参考：

| 项目 | 当前值 |
| --- | ---: |
| JS gzip | 约 82KB |
| CSS gzip | 约 4.8KB |
| Geist Sans | 约 69.6KB |
| 完整生产产物 | 约 418KB |

Chrome/Edge 隔离验证环境未能成功注册本地未打包扩展，扩展页返回 `ERR_FILE_NOT_FOUND`。该环境问题已记录在 KEV-155，没有因此修改产品代码；实际项目应按 README 从稳定目录加载扩展完成最终浏览器验收。

## 七、下一阶段：shadcn/ui 深度重构

下一阶段记录在 Linear KEV-157，目前只完成规划，尚未开始实现。

### 7.1 目标

在当前设计 Token 基础上，把通用交互逐步收敛到 shadcn/ui 原语，把业务差异保留在 My Tabs 领域组件中：

1. shadcn/ui 负责通用交互、状态和可访问性。
2. Tailwind 负责布局、尺寸、间距和组合。
3. 自定义组件只保留书签、文件夹和 Dock 的业务语义。

### 7.2 计划组件

- Button
- Card
- Tooltip
- Popover
- DropdownMenu
- Separator
- Icon
- BookmarkTile
- DockToolMenu

Lucide 只按需导入实际使用的图标，不做无差别全局安装；品牌图标仍保持现有 SVG 资源。

### 7.3 推荐迁移顺序

1. 固化现有 Token 和组件状态矩阵。
2. 建立 shadcn 基础原语和 `cn` 工具约定。
3. 先迁移 Button、Card、Separator、Tooltip 等低风险组件。
4. 抽象统一的 `Icon` 和 `BookmarkTile`。
5. 迁移 BookmarkCard、BookmarkList、BookmarkFolder 和首页布局。
6. 最后迁移 DockToolMenu、Popover 和菜单语义。
7. 每个阶段删除对应旧 CSS，避免双轨维护。
8. 重新执行测试、类型检查、构建、体积预算和浏览器验收。

### 7.4 下一阶段边界

下一阶段仍然不新增产品能力，不引入第二套页面，不重绘品牌 Logo，不添加搜索、编辑、拖拽、设置或主题按钮。只有当实际浏览器验收发现定位、焦点或键盘行为问题时，才单独评估将现有 Popover 替换为 Radix/shadcn 实现。

## 八、后续维护原则

- Token 只在全局样式入口维护，组件不得重复声明同义颜色。
- 品牌 SVG 和单色自适应 SVG 的职责分离。
- shadcn 原语按需引入，避免为了“看起来统一”增加无用依赖。
- 任何组件迁移都必须保留既有行为测试。
- 任何视觉升级都必须同时检查明暗主题、焦点、Reduced Motion 和包体积。
- 开发浏览器只加载稳定开发目录，不直接加载 WXT 临时目录。
- 先完成当前阶段验收，再开始下一阶段重构，避免多个迁移阶段交叉修改。
