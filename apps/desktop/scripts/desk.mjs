import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectVersion } from '../../../scripts/version.mjs';

const projectDirectory = fileURLToPath(new URL('..', import.meta.url));
const buildScript = fileURLToPath(new URL('build.sh', import.meta.url));

export function runDesk(mode, { platform = process.platform, run = spawnSync, report = console.error } = {}) {
  if (platform !== 'darwin') {
    report('桌面应用需要在 macOS 上运行和构建');
    return 1;
  }
  if (mode !== 'dev' && mode !== 'build') {
    report('桌面命令仅支持 dev 或 build 模式');
    return 2;
  }

  for (const [tool, args, help] of [
    ['xcodebuild', ['-version'], '请安装并配置 Xcode'],
    ['xcodegen', ['--version'], '请安装 xcodegen'],
  ]) {
    const result = run(tool, args, { stdio: 'ignore' });
    if (result.error || result.status !== 0) {
      report(`未找到或无法运行 ${tool}，${help}`);
      return 1;
    }
  }

  let version;
  try {
    version = readProjectVersion();
  } catch (error) {
    report(error.message);
    return 1;
  }
  const result = run('/bin/zsh', [buildScript, mode], {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: { ...process.env, EXTS_BUILD_VERSION: version },
  });
  if (result.error || result.status === null) {
    report(`桌面构建进程未正常结束${result.error ? `：${result.error.message}` : ''}`);
    return 1;
  }
  return result.status;
}

// 被测试导入时不执行命令，仅在作为根命令入口运行时分派。
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runDesk(process.argv[2]);
}
