# Oh My 产品命名迁移：交付记录

## 元信息

- 工作项：`2026-09-30-repo-rename-ohmy-products`
- 对应 Issue：[Oh My 产品命名迁移](../issues/2026-09-30-repo-rename-ohmy-products-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- OmyTabs、OmyDL 和 Omy Photos 的完整 Oh My 命名迁移。
- 旧标识不保留兼容层，X Download 及 X Download Helper 保持不变。
- 自动化验证、用户验收步骤和外部系统待办的事实记录。

## 实际完成内容

- 将 `apps/extensions/omytabs`、`apps/extensions/omydl` 和 `apps/desktop/omy-photos` 迁移为 `ohmy-tabs`、`ohmy-dl` 和 `ohmy-photos`，同步更新资源、包名、内部协议、Swift 模块和 Bundle 标识。
- 更新根命令、workspace lock importer、发布工作流、README/WXT/Monorepo 当前文档和活动规范；保留历史记录事实名称。
- 保持 X Download 与 X Download Helper 路径、通信和业务代码不变，不增加旧名称兼容层。

## 验证结果

- Oh My Tabs：本地 `tsc --noEmit`、Vitest（8 个文件/33 个测试）、WXT build、Manifest/Logo 断言和 bundle budget 检查通过。
- Oh My DL：本地 `tsc --noEmit`、WXT build、WXT zip、ZIP Manifest/Logo 断言通过；Vitest 在收集前因 WXT 无法绑定 localhost 随机端口失败，固定 `PORT=31999` 重试仍失败，已记录为环境限制。
- Oh My Photos：`xcodegen generate`、`scripts/build.sh`、`xcodebuild build-for-testing`、Bundle 可执行文件和 `plutil` 检查通过，Bundle 为 `dev.kevinstack.ohmyphotos` / `Oh My Photos` / macOS 27.0。
- `packages/stable-extension-dev`：Vitest 7 个测试通过；锁文件 importer、活动旧标识扫描、旧目录不存在、X Download/X Download Helper diff 和 `git diff --check` 通过。

## 未验证事项与限制

- 真实 Chrome/Edge 加载、视觉交互、macOS App 使用和 iPhone 设备流程需要用户验收。
- Oh My DL Vitest 仍受本机 localhost 端口绑定限制；Oh My Photos 的直接 XCTest/测试目标编译因当前 Xcode DerivedData 权限与 scheme 配置限制未完成，需要用户或 CI 环境补验。
- GitHub、商店、远端仓库和 Release 后台不在本地迁移范围内。

## 用户验收

- 结果：已通过
- 说明：用户明确要求提交到本地，按仓库流程视为验收通过并批准最终提交；真实 Chrome/Edge 加载、macOS App 使用和 iPhone 设备流程仍按未验证事项保留。

## 最终 Commit message

refactor(repo): 统一 Oh My 产品路径与标识迁移

- 迁移 Oh My Tabs、Oh My DL 与 Oh My Photos 的目录、包名、工程和运行时标识
- 更新 workspace、发布工作流、文档和资源路径，保留 X Download 系列契约
- 完成本地 WXT、Xcode、锁文件和静态引用验证并记录环境限制

## 最终提交批准

- 状态：已批准
- 说明：用户已明确要求本地提交；已执行上述单个最终 Commit，不推送远端。
