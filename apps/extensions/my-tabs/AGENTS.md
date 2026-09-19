# 子项目规范

## 网站图标

- 网站品牌图标的来源为 [Simple Icons](https://simpleicons.org/)。
- 图标资源仓库为 [simple-icons/simple-icons](https://github.com/simple-icons/simple-icons)。
- `src/assets/brand/` 中的书签图标必须优先从 Simple Icons 查找；不适用于通用工具资源 `src/assets/tools/` 和插件自身图标 `src/assets/logo/`。
- 仅当 Simple Icons 没有对应图标时，才根据用户提供的图片重绘原生 SVG，不直接嵌入或引用位图。
- 重绘 SVG 必须使用 `viewBox="0 0 24 24"`，不写 `width`、`height`；并包含 `role="img"`、可访问的 `<title>` 与一个或多个 `<path>`。
- 书签 SVG 的统一色值为黑色 `#000000`：优先省略 `fill` 以使用 SVG 默认黑色；如需显式声明，必须使用 `fill="#000000"`。不得使用其他色值、渐变、阴影、纹理或透明度效果，并保留小尺寸下可辨识的核心特征。
- 文字类书签 SVG 统一命名为 `text-<书签 id>.svg`（例如 `text-pmi.svg`），文字置于透明 `128×128` 画布中央；允许通过等比或非等比缩放让文字主体更饱满，但不得超出安全边距。

## shadcn/ui 受控引入

- My Tabs 以 shadcn/ui 与 Radix 原语作为通用 UI 基础，但只按已批准的真实交互需求引入组件；禁止执行 `shadcn add --all`，不得为了形式统一机械替换业务组件。
- `src/components/ui/` 只维护项目持有的通用 shadcn/ui 原语源码，不得包含书签、Dock、Chrome API 或其他业务逻辑；业务差异应在 `src/features/` 或现有业务组件中通过组合、variant 和 `className` 实现。
- 当前受控范围只包含 `Button`、`Tooltip`、`DropdownMenu` 和已有 `Separator`；`Card`、shadcn `Popover`、`Dialog` 与 `AlertDialog` 在没有独立需求和用户批准前不得引入。
- 添加或更新 shadcn/ui 原语前必须检查生成差异，不得直接覆盖本地 Token、字体或已批准的可访问性定制；组件升级必须保留与真实行为和架构边界对应的现有测试。
- 全局只创建一个 `TooltipProvider`；不得为每个 Dock 项目重复创建 Provider。
- Tooltip 只承担简短的 Hover 与键盘 Focus 提示，不得包含链接、按钮、书签列表或其他可交互内容；书签入口显示书签名，工具分组显示分组名，菜单打开时不得残留 Tooltip。
- Tooltip、DropdownMenu、Button 与链接组合时必须通过 `asChild` 等方式共享唯一真实交互元素；禁止生成嵌套 `<button>`、`<button><a>` 或其他嵌套交互控件。

## 图标职责

- `UiIcon` 只适配 Lucide 通用 UI 图标，统一使用 `currentColor`、已批准的尺寸和线宽；只能显式静态导入实际使用的图标。
- 禁止 `import * as Icons from 'lucide-react'`、完整图标注册表、根据任意字符串动态访问 Lucide 全量导出或其他可能将整套图标打入产物的方式。
- `BookmarkIcon` 只管理品牌、网站书签、文字 Logo 和既有 SVG/PNG 资源，并继续遵守原色与自适应单色规则；不得使用 Lucide 重绘或替换品牌 Logo。
- 被 Lucide 替代的通用功能 SVG 在完成迁移和验收后必须删除，不得长期保留两套等价资源或运行时实现。

## Dock 交互

- Dock 当前只允许两类入口：`link` 入口使用真实链接语义并直接打开网页；`menu` 入口使用真实按钮语义并在点击或键盘操作后打开 `DropdownMenu`。
- Dock 入口 Hover 或键盘 Focus 时只显示 Tooltip；不得通过 Hover 直接展开 DropdownMenu，也不得让同一个弹层同时承担 Tooltip 和菜单职责。
- DropdownMenu 中的网页入口优先使用真实 `<a>`；仅在需要调用 Chrome API、创建标签组或执行非导航操作时使用命令型菜单项。
- Dock 位于视口底部，DropdownMenu 默认从上方弹出并支持碰撞调整；必须验证菜单在 `1280×720`、缩放后 CSS 视口 `640×360` 以及 100%、125%、150%、200% 缩放下不被裁剪或移出视口。
- DropdownMenu 必须覆盖 Enter、Space 或 ArrowDown 打开、方向键移动、Enter 激活、Esc 关闭并恢复触发器焦点、外部点击关闭等行为；Portal 必须正确继承明暗主题 Token 和层级。
- 已废弃的自定义 Popover 不得重新引入；DropdownMenu 与 Tooltip 分别承担菜单和提示职责，不维护双轨实现。
- 桌面应用、搜索、编辑、拖拽、设置、主题按钮、`Dialog`、`AlertDialog` 和新的全局状态管理均不属于当前功能范围；新增时必须建立新的本地 Issue，并按任务规模完成必要设计批准。

## My Tabs 验收

- 自动化测试覆盖不依赖真实浏览器布局与焦点环境的配置、数据处理、链接安全属性和必要架构边界；不得用假 DOM 模拟 Tooltip、菜单、键盘、焦点或指针交互。
- 架构测试只用于防止高风险边界回退，例如旧 Popover、Lucide 全量导入、业务逻辑进入 `src/components/ui/` 或未批准的 shadcn 原语被重新引入；不得大量断言源码文本和内部实现形式。
- 每个阶段的类型检查、定向测试、全量测试、生产构建和现有包体积检查必须通过；包体积检查继续作为安全门禁，但未触发预算失败时不单独扩展体积治理范围。
- 功能阶段完成后由用户在 Chrome 或 Edge 实际加载稳定开发目录，验证明暗主题、Tooltip、菜单、键盘、焦点恢复和约定缩放场景；用户未明确验收通过前不得进入最终提交准备。
