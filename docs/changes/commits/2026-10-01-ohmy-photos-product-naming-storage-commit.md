# 统一 OhMy Photos 显示名称与本地目录：交付记录

## 元信息

- 工作项：`2026-10-01-ohmy-photos-product-naming-storage`
- 对应 Issue：[统一 OhMy Photos 显示名称与本地目录](../issues/2026-10-01-ohmy-photos-product-naming-storage-issue.md)
- 状态：已完成
- 用户验收：已通过；用户明确要求提交
- 最终提交批准：已批准
- 创建日期：2026-10-01
- 最近更新：2026-10-01

## 预期交付边界

- 应用可见名称和后续新建本地目录统一为 `OhMy Photos`。
- 保留 Target、Scheme、仓库目录、Bundle Identifier 和旧目录内容。

## 实际完成内容

- 统一窗口标题、连接页标题和 Bundle 显示名为 `OhMy Photos`。
- 将新下载目录和缩略图缓存目录统一为 `OhMy Photos`，未触碰旧目录内容。

## 验证结果

- 名称与目录断言：通过。
- `xcodegen generate`：通过。
- `xcodebuild build -project OhMyPhotos.xcodeproj -scheme OhMyPhotos -sdk macosx -configuration Debug -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO`：通过，输出 `** BUILD SUCCEEDED **`。
- Bundle 检查：`CFBundleDisplayName=OhMy Photos`、`CFBundleIdentifier=dev.kevinstack.ohmyphotos`、`LSMinimumSystemVersion=27.0`。
- 旧名称残留检查和 `git diff --check`：通过。

## 未验证事项与限制

- 代理环境未替代用户实际检查新下载目录和旧目录保留行为；用户已确认继续提交。

## 用户验收

- 结果：通过。
- 说明：用户已确认提交当前 Issue；真实目录行为限制保留在验证记录中。

## 最终 Commit message

```text
feat(ohmy-photos): 统一显示名称与本地目录

- 将应用显示名统一为 OhMy Photos
- 将新下载与缩略图缓存目录统一为 OhMy Photos
```

## 最终提交批准

- 状态：已批准。
- 说明：用户明确要求提交到本地。
