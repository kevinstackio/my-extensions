# Popover 迁移决策

## 结论

保留现有 `Popover` 的交互实现，本阶段只迁移视觉样式与行为测试，不引入 Radix Popover 作为底层替换。

## 决策依据

- 现有实现已经覆盖触发器点击、鼠标悬停、160ms 离开延迟、Esc 关闭、外部点击关闭和焦点恢复。
- 现有 `placement`、箭头开关和隐藏状态等 DOM 契约稳定，Dock 只需要复用这些行为，不需要新增组件 API。
- 迁移到 Radix 会增加交互底层替换范围，暂时没有足够收益抵消焦点管理、定位和构建产物回归风险。
- 视觉层已经统一使用 `--popover`、`--popover-foreground`、`--border`、`--radius-md` 和 `--shadow-floating`，明暗主题不再依赖硬编码边框颜色。

## 本阶段验证

- Popover 定向测试：5/5 通过。
- 全量测试：15 个测试文件、58/58 通过。
- TypeScript：`pnpm --filter @my-extensions/my-tabs typecheck` 通过。
- 生产构建：`pnpm --filter @my-extensions/my-tabs build` 通过。
- 包体积预算：`pnpm --filter @my-extensions/my-tabs check:bundle-size` 通过；当前 JS gzip 82,132 bytes、CSS gzip 4,881 bytes、字体 69,652 bytes。
- Chrome 实际加载与最终视觉验收留到最终质量阶段统一执行，不在本阶段重复打断设计验收节奏。

## 后续边界

如果最终 Chrome 验收发现定位、焦点或键盘行为问题，再单独评估 Radix 替换；在此之前不保留第二套 Popover 实现，也不同时维护两套样式。
