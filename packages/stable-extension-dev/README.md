# Stable Extension Dev

为基于 WXT 的 Chrome/Edge 扩展提供稳定的本地开发产物。

## 为什么需要它

WXT 开发模式会持续把产物写入临时目录。重新构建开始时，这个目录可能被清空；如果浏览器直接加载该目录，构建失败或构建过程中的中间状态可能让已加载的扩展暂时不可用。

本工具在 WXT 构建完成后校验完整产物，并将它发布到同级的稳定目录：

```text
临时开发产物：dist/chrome-mv3-dev/
稳定开发产物：dist/chrome-mv3-dev-stable/
生产产物：    dist/chrome-mv3/
```

浏览器只加载稳定开发目录。成功构建才会更新稳定目录；失败构建不会删除或覆盖上一份成功产物。

## 适用范围

- WXT 管理的 Chrome 或 Edge 扩展。
- 需要让浏览器持续加载上一份完整开发产物的本地开发流程。
- 不希望额外启动常驻复制脚本或第二个终端进程的项目。

本工具只处理构建产物发布，不负责启动 WXT、提供 HMR，也不负责自动打开浏览器。

## WXT 接入

在扩展的 `wxt.config.ts` 中引入 hook：

```ts
import { createStableDevelopmentHooks } from '@my-extensions/stable-extension-dev';
import { defineConfig } from 'wxt';

export default defineConfig({
  hooks: {
    ...createStableDevelopmentHooks(),
  },
});
```

接入后继续使用项目原有的开发命令，例如：

```bash
pnpm dev
```

工具只在 WXT 的 `serve` 开发命令中发布稳定产物。生产构建不会额外生成 `-stable` 目录。

## 发布保证

每次开发构建完成后，工具会：

1. 确认源构建目录存在且确实是目录。
2. 确认 `manifest.json` 可读取、可解析，且 Manifest 版本、名称和版本号完整。
3. 确认 WXT 报告的公共资源和构建 chunk 都存在且是普通文件。
4. 将完整源目录复制到稳定目录旁的暂存目录。
5. 再次校验暂存目录。
6. 通过同文件系统的目录替换更新稳定目录。

如果校验、复制或目录替换失败：

- 当前稳定目录保持不变。
- 不会把不完整的开发产物发布给浏览器。
- Windows 文件占用或替换失败时会抛出带错误码的 `StableDevelopmentError`。
- 如果旧目录无法恢复，错误信息会给出旧目录备份路径。

暂存目录和备份目录会在成功完成后清理；清理失败不会破坏已经发布的稳定目录。

## 自定义稳定目录后缀

默认后缀是 `-stable`：

```ts
createStableDevelopmentHooks({ suffix: '-browser' });
```

例如，`dist/chrome-mv3-dev` 会发布到 `dist/chrome-mv3-dev-browser`。后缀必须是单一目录名片段，不能包含路径分隔符。

## 直接使用发布器

如果项目需要自行控制 WXT hook，也可以直接调用 `publishStableBuild`：

```ts
import { publishStableBuild } from '@my-extensions/stable-extension-dev';

await publishStableBuild({
  sourceDir: 'dist/chrome-mv3-dev',
  targetDir: 'dist/chrome-mv3-dev-stable',
  requiredFiles: ['manifest.json', 'background.js'],
});
```

`manifest.json` 无论是否出现在 `requiredFiles` 中都会被强制校验。`requiredFiles` 中的路径必须是源目录内的相对文件路径，不能包含绝对路径或 `..`。

返回值：

```ts
{
  targetDir: string;
  backupDir?: string;
}
```

正常情况下 `backupDir` 不存在；只有旧目录替换完成后清理失败时才会返回备份目录路径。

## 浏览器使用方式

开发时：

1. 运行扩展原有的 WXT 开发命令。
2. 等待第一次构建成功并看到稳定产物发布日志。
3. 在 Chrome 或 Edge 的扩展管理页面选择“加载已解压的扩展程序”。
4. 选择 `dist/<browser>-mv<manifest>-dev-stable/`。

生产验收时选择 `dist/<browser>-mv<manifest>/`，不要加载 WXT 的 `-dev` 临时目录。

如果控制台出现 `localhost:<port>` 的 WebSocket connection refused：

- 确认 WXT 开发命令仍在运行。
- 确认浏览器连接的是当前开发服务器端口。
- 稳定产物工具不会启动或代理 WXT 的 WebSocket 服务。

## 测试

本包的自动化测试覆盖：

- 成功发布完整构建。
- 无效 Manifest 拒绝发布。
- 缺少必需文件拒绝发布。
- 复制或目录替换失败时保留旧稳定目录。
- Windows 风格的 `EPERM` 替换异常。
- WXT 开发命令发布稳定目录。
- WXT 生产构建不发布稳定目录。

运行测试：

```bash
pnpm --filter @my-extensions/stable-extension-dev test
```

集成扩展还应在 Chrome 或 Edge 中完成一次“成功构建 → 构建失败 → 修复后恢复构建”的实际加载验证。

## 当前状态

当前包作为 `my-extensions` monorepo 中的验证实现，首个接入项目是 `apps/extensions/tg-download`。它的通用目标是沉淀为独立的 WXT 开发工具；扩展项目不应复制内部的校验、复制或目录替换逻辑。
