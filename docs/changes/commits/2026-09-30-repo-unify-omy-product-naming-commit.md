# 统一 OmyExts 仓库与产品命名：交付记录

## 元信息

- 工作项：`2026-09-30-repo-unify-omy-product-naming`
- 对应 Issue：[统一 OmyExts 仓库与产品命名](../issues/2026-09-30-repo-unify-omy-product-naming-issue.md)
- 状态：待填写
- 用户验收：待验收
- 最终提交批准：待批准
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- 将本地仓库品牌、根包名与 workspace scope 统一为 OmyExts、`omyexts` 与 `@omyexts/*`。
- 将 My Tabs 完整迁移为 OmyTabs，将 TG Download 浏览器扩展完整迁移为 OmyDL。
- 将唯一官网从 `apps/web` 迁移到 `apps/website`，使用 OmyExts 展示品牌。
- 同步根命令、资源路径、测试、构建产物、发布工作流、锁文件和现行文档引用。
- OmyDL 直接切换到新的存储键、文件选择器 ID、运行时消息和资源标识，不保留旧历史或旧文件选择器目录记忆。
- 保持 X Download 与 X Download Helper 的目录、标识、命令和通信行为不变；不实施桌面端迁移或 X 功能合并。
- 只提供 GitHub 侧切换清单，不执行仓库改名、远端配置或推送。

## 实际完成内容

待实施。

## 验证结果

待实施。

## 未验证事项与限制

- 待迁移 Spec 与 Plan 批准后执行验证。
- 浏览器加载、扩展交互与官网视觉结果由用户验收。
- 本次不保留旧下载历史和旧文件选择器目录记忆。
- GitHub 仓库改名、远端地址、商店后台和外部平台更新由用户执行。

## 用户验收

- 结果：待验收
- 说明：待完成阶段交付后由用户确认。

## 最终 Commit message

待实施完成后确定。

## 最终提交批准

- 状态：待批准
- 说明：待展示完整 diff、验证结果与最终 Commit message 后，由用户明确决定。
