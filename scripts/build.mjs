import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectVersion, repositoryDirectory } from './version.mjs';

export function buildAll({ platform = process.platform, run = spawnSync } = {}) {
  if (platform !== 'darwin') throw new Error('完整 build 需要 macOS；请单独使用 web:build 或 ext:build');
  const version = readProjectVersion();
  for (const [command, args] of [['xcodebuild', ['-version']], ['xcodegen', ['--version']]]) {
    const result = run(command, args, { stdio: 'ignore' });
    if (result.error || result.status !== 0) throw new Error(`无法运行 ${command}，未开始构建`);
  }
  for (const task of ['web:build', 'ext:build', 'desk:build']) {
    const result = run('pnpm', [task], {
      cwd: repositoryDirectory,
      stdio: 'inherit',
      env: { ...process.env, EXTS_BUILD_VERSION: version },
    });
    if (result.error || result.status !== 0) {
      throw new Error(`${task} 构建失败，退出码 ${result.status ?? '未知'}`, { cause: result.error });
    }
  }
  readProjectVersion(version);
  const output = {
    version,
    websiteDir: join(repositoryDirectory, 'dist/build/exts-web'),
    extensionDir: join(repositoryDirectory, 'dist/build/chrome-mv3'),
    desktopApp: join(repositoryDirectory, 'dist/build/exts.app'),
  };
  readFileSync(join(output.websiteDir, 'index.html'));
  const manifest = JSON.parse(readFileSync(join(output.extensionDir, 'manifest.json'), 'utf8'));
  if (manifest.version !== version) throw new Error('扩展产物版本与根版本不一致');
  for (const key of ['CFBundleShortVersionString', 'CFBundleVersion']) {
    const result = run('/usr/libexec/PlistBuddy', ['-c', `Print ${key}`, join(output.desktopApp, 'Contents/Info.plist')], { encoding: 'utf8' });
    if (result.status !== 0 || result.stdout?.trim() !== version) throw new Error(`桌面产物 ${key} 与根版本不一致`);
  }
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const output = buildAll();
    console.log(`三端正式构建完成：${output.version}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
