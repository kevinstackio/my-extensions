import { spawnSync } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './build.mjs';
import { readProjectVersion, repositoryDirectory } from './version.mjs';

export function releaseAll({
  platform = process.platform,
  build = buildAll,
  run = spawnSync,
  releaseDirectory = join(repositoryDirectory, 'dist/release'),
} = {}) {
  if (platform !== 'darwin') throw new Error('完整 release 需要 macOS，Windows 不生成 ZIP 或 DMG');
  const version = readProjectVersion();
  const zipName = `exts-extension-${version}.zip`;
  const dmgName = `exts-macos-${version}.dmg`;
  const zipPath = join(releaseDirectory, zipName);
  const dmgPath = join(releaseDirectory, dmgName);
  const checkConflicts = () => {
    for (const path of [zipPath, dmgPath]) {
      if (existsSync(path)) throw new Error(`同版本分发包已存在，不覆盖：${path}`);
    }
  };
  const execute = (label, command, args, options = {}) => {
    const result = run(command, args, { stdio: 'inherit', ...options });
    if (result.error || result.status !== 0) {
      throw new Error(`${label}失败，退出码 ${result.status ?? '未知'}`, { cause: result.error });
    }
    return result.stdout;
  };

  checkConflicts();
  for (const [command, args] of [['/usr/bin/zip', ['-v']], ['/usr/bin/unzip', ['-v']], ['/usr/bin/hdiutil', ['help']]]) {
    execute(`检查打包工具 ${command}`, command, args, { stdio: 'ignore' });
  }
  const output = build({ platform, run });
  if (output.version !== version) throw new Error('构建产物版本与本次 release 版本不一致');
  readProjectVersion(version);
  checkConflicts();
  mkdirSync(releaseDirectory, { recursive: true });
  const stagingDirectory = mkdtempSync(join(releaseDirectory, '.exts-release-'));
  const published = [];

  try {
    const stagedZip = join(stagingDirectory, zipName);
    const stagedDmg = join(stagingDirectory, dmgName);
    execute('生成扩展 ZIP', '/usr/bin/zip', ['-qr', stagedZip, '.'], { cwd: output.extensionDir });
    execute('校验扩展 ZIP', '/usr/bin/unzip', ['-tq', stagedZip]);
    const manifest = JSON.parse(execute('读取 ZIP 根 Manifest', '/usr/bin/unzip', ['-p', stagedZip, 'manifest.json'], { stdio: 'pipe', encoding: 'utf8' }));
    if (manifest.version !== version || manifest.manifest_version !== 3) throw new Error('ZIP 根 Manifest 版本或格式不一致');

    const imageDirectory = join(stagingDirectory, 'image');
    mkdirSync(imageDirectory);
    const appPath = join(imageDirectory, 'exts.app');
    execute('复制正式应用', '/usr/bin/ditto', [output.desktopApp, appPath]);
    const plist = join(appPath, 'Contents/Info.plist');
    for (const [key, expected] of [['CFBundleIdentifier', 'dev.linguio.exts'], ['CFBundleShortVersionString', version], ['CFBundleVersion', version]]) {
      const actual = execute(`读取应用 ${key}`, '/usr/libexec/PlistBuddy', ['-c', `Print ${key}`, plist], { stdio: 'pipe', encoding: 'utf8' });
      if (actual?.trim() !== expected) throw new Error(`DMG 应用 ${key} 不一致`);
    }
    execute('创建 Applications 入口', '/bin/ln', ['-s', '/Applications', join(imageDirectory, 'Applications')]);
    execute('生成 DMG', '/usr/bin/hdiutil', ['create', '-volname', `Exts ${version}`, '-srcfolder', imageDirectory, '-format', 'UDZO', stagedDmg]);
    execute('校验 DMG', '/usr/bin/hdiutil', ['verify', stagedDmg]);
    readProjectVersion(version);

    // 暂存与最终文件同盘；硬链接原子创建，目标已存在时失败而不覆盖。
    for (const [source, target] of [[stagedZip, zipPath], [stagedDmg, dmgPath]]) {
      linkSync(source, target);
      published.push(target);
    }
    return { version, zipPath, dmgPath };
  } catch (error) {
    // 只撤销本次已经创建的文件，不删除其他版本或先前存在的包。
    for (const path of published) rmSync(path, { force: true });
    throw error;
  } finally {
    rmSync(stagingDirectory, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const output = releaseAll();
    console.log(`本地分发包完成：${output.version}\n${output.zipPath}\n${output.dmgPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
