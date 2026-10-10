import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const versionModule = new URL('../scripts/version.mjs', import.meta.url);
const buildModule = new URL('../scripts/build.mjs', import.meta.url);
const releaseModule = new URL('../scripts/release.mjs', import.meta.url);

test('固定两包中第二个替换失败时恢复旧包，无旧包时撤销新包', async (context) => {
  const { publishReleaseFiles } = await import(releaseModule);
  assert.equal(typeof publishReleaseFiles, 'function');
  for (const hasPrevious of [false, true]) {
    await context.test(hasPrevious ? '恢复旧包' : '撤销新包', () => {
      const root = mkdtempSync(join(tmpdir(), 'exts-replace-'));
      const stagingDirectory = join(root, '.exts-staging-test');
      mkdirSync(stagingDirectory);
      const files = ['exts-chrome.zip', 'exts-mac.dmg'].map((name) => ({ source: join(stagingDirectory, name), target: join(root, name) }));
      try {
        for (const file of files) {
          writeFileSync(file.source, 'new-package');
          if (hasPrevious) writeFileSync(file.target, 'old-package');
        }
        assert.throws(() => publishReleaseFiles(files, stagingDirectory, {
          rename(source, target) {
            if (source === files[1].source) throw new Error('模拟文件占用');
            renameSync(source, target);
          },
        }), /模拟文件占用/);
        for (const file of files) {
          if (hasPrevious) assert.equal(readFileSync(file.target, 'utf8'), 'old-package');
          else assert(!existsSync(file.target));
        }
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  }
});

test('恢复操作也被文件占用阻止时保留旧包备份并给出恢复目录', async () => {
  const { publishReleaseFiles } = await import(releaseModule);
  assert.equal(typeof publishReleaseFiles, 'function');
  const root = mkdtempSync(join(tmpdir(), 'exts-recovery-'));
  const stagingDirectory = join(root, '.exts-staging-test');
  mkdirSync(stagingDirectory);
  const files = ['exts-chrome.zip', 'exts-mac.dmg'].map((name) => ({ source: join(stagingDirectory, name), target: join(root, name) }));
  try {
    for (const file of files) {
      writeFileSync(file.source, 'new-package');
      writeFileSync(file.target, 'old-package');
    }
    let count = 0;
    assert.throws(() => publishReleaseFiles(files, stagingDirectory, {
      rename(source, target) {
        if (++count > 1) throw new Error('模拟替换及恢复失败');
        renameSync(source, target);
      },
    }), (error) => {
      assert.equal(error.recoveryDirectory, stagingDirectory);
      assert(error.message.includes(stagingDirectory));
      return true;
    });
    const retained = readdirSync(stagingDirectory).filter((name) => name.startsWith('.previous-'));
    assert.equal(retained.length, 2);
    assert(retained.every((name) => readFileSync(join(stagingDirectory, name), 'utf8') === 'old-package'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('产品版本校验拒绝缺失、非数字、前导零和平台不兼容版本', async () => {
  const { validateProjectVersion } = await import(versionModule);
  assert.equal(validateProjectVersion('1.0.0'), '1.0.0');
  assert.equal(validateProjectVersion('9999.99.99'), '9999.99.99');
  for (const value of [undefined, '', '0.0.0', '01.0.0', '1.0', '1.0.0-beta', '10000.0.0', '1.100.0', '1.0.100']) {
    assert.throws(() => validateProjectVersion(value), /版本/);
  }
});

test('从其他目录执行版本命令仍读取根版本', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(versionModule)], { cwd: tmpdir(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const metadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(result.stdout.trim(), metadata.version);
});

test('传入不同版本不能覆盖根版本', async () => {
  const { readProjectVersion } = await import(versionModule);
  assert.throws(() => readProjectVersion(`${readProjectVersion()}-different`), /不一致/);
});

test('非 macOS 根 build 在启动工具和写入产物前明确失败', async () => {
  const { buildAll } = await import(buildModule);
  assert.throws(() => buildAll({ platform: 'win32', run() { assert.fail('不得启动工具'); } }), /macOS/);
});

test('构建前缺少桌面工具时不启动应用构建', async () => {
  const { buildAll } = await import(buildModule);
  const calls = [];
  assert.throws(() => buildAll({ platform: 'darwin', run(command) {
    calls.push(command);
    return { status: 1 };
  } }), /xcodebuild/);
  assert.deepEqual(calls, ['xcodebuild']);
});

test('网站构建失败后停止，不启动扩展和桌面构建', async () => {
  const { buildAll } = await import(buildModule);
  const calls = [];
  assert.throws(() => buildAll({ platform: 'darwin', run(command, args) {
    calls.push({ command, args });
    return { status: command === 'pnpm' ? 9 : 0 };
  } }), /web:build.*9/);
  assert.deepEqual(calls.filter(call => call.command === 'pnpm').map(call => call.args), [['web:build']]);
});

test('非 macOS release 不启动构建或打包工具', async () => {
  const { releaseAll } = await import(releaseModule);
  assert.throws(() => releaseAll({ platform: 'win32', build() { assert.fail('不得构建'); }, run() { assert.fail('不得打包'); } }), /macOS/);
});

test('已有固定包时构建失败仍保留旧包', async () => {
  const { releaseAll } = await import(releaseModule);
  const { readProjectVersion } = await import(versionModule);
  const root = mkdtempSync(join(tmpdir(), 'exts-release-conflict-'));
  try {
    const existing = join(root, 'exts-chrome.zip');
    writeFileSync(existing, 'previous');
    assert.throws(() => releaseAll({ platform: 'darwin', releaseDirectory: root, build() { throw new Error('构建失败'); }, run() { return { status: 0 }; } }), /构建失败/);
    assert.equal(readFileSync(existing, 'utf8'), 'previous');
    assert.deepEqual(readdirSync(root), [existing.split(/[\\/]/).at(-1)]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('build 失败不开始打包或创建临时产物', async () => {
  const { releaseAll } = await import(releaseModule);
  const root = mkdtempSync(join(tmpdir(), 'exts-release-build-'));
  try {
    assert.throws(() => releaseAll({ platform: 'darwin', releaseDirectory: root,
      build() { throw new Error('构建失败'); },
      run(command, args) { assert(!args.includes('-qr')); return { status: 0 }; },
    }), /构建失败/);
    assert.deepEqual(readdirSync(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ZIP 校验失败不发布残缺文件并清理本次暂存', async () => {
  const { releaseAll } = await import(releaseModule);
  const { readProjectVersion } = await import(versionModule);
  const root = mkdtempSync(join(tmpdir(), 'exts-release-zip-'));
  try {
    assert.throws(() => releaseAll({ platform: 'darwin', releaseDirectory: root,
      build() { return { version: readProjectVersion(), extensionDir: root, desktopApp: join(root, 'exts.app') }; },
      run(command, args) {
        if (args.includes('-qr')) writeFileSync(args[1], 'partial');
        return { status: args.includes('-tq') ? 2 : 0 };
      },
    }), /ZIP/);
    assert(!existsSync(join(root, 'exts-chrome.zip')));
    assert.deepEqual(readdirSync(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('release 成功时替换固定两包，DMG 校验失败保留旧包', async (context) => {
  const { releaseAll } = await import(releaseModule);
  const { readProjectVersion } = await import(versionModule);
  for (const failVerify of [false, true]) {
    await context.test(failVerify ? 'DMG 校验失败' : '调度与最终文件发布成功', () => {
      const root = mkdtempSync(join(tmpdir(), 'exts-release-flow-'));
      const version = readProjectVersion();
      const releaseDirectory = join(root, 'release');
      mkdirSync(releaseDirectory);
      writeFileSync(join(releaseDirectory, 'exts-chrome.zip'), 'old-zip');
      writeFileSync(join(releaseDirectory, 'exts-mac.dmg'), 'old-dmg');
      const extensionDir = join(root, 'extension');
      const desktopApp = join(root, 'exts.app');
      mkdirSync(extensionDir);
      mkdirSync(join(desktopApp, 'Contents'), { recursive: true });
      const manifest = JSON.stringify({ manifest_version: 3, version });
      writeFileSync(join(extensionDir, 'manifest.json'), manifest);
      writeFileSync(join(desktopApp, 'Contents/Info.plist'), JSON.stringify({ CFBundleIdentifier: 'dev.linguio.exts', CFBundleVersion: version, CFBundleShortVersionString: version }));
      try {
        // 系统命令用可控替代实现验证调度和真实文件发布，不表示 macOS 工具实测通过。
        const options = { platform: 'darwin', releaseDirectory,
          build() { return { version, extensionDir, desktopApp }; },
          run(command, args) {
            if (command.endsWith('/zip') && args[0] === '-qr') writeFileSync(args[1], 'zip-fixture');
            if (command.endsWith('/unzip') && args[0] === '-p') return { status: 0, stdout: manifest };
            if (command.endsWith('/ditto')) cpSync(args[0], args[1], { recursive: true });
            if (command.endsWith('/PlistBuddy')) {
              const values = JSON.parse(readFileSync(args[2], 'utf8'));
              return { status: 0, stdout: `${values[args[1].slice(6)]}\n` };
            }
            if (command === '/bin/ln') writeFileSync(args[2], '/Applications');
            if (command.endsWith('/hdiutil') && args[0] === 'create') {
              assert.deepEqual(readdirSync(args[args.indexOf('-srcfolder') + 1]).sort(), ['Applications', 'exts.app']);
              writeFileSync(args.at(-1), 'dmg-fixture');
            }
            return { status: failVerify && args[0] === 'verify' ? 9 : 0 };
          },
        };
        if (failVerify) {
          assert.throws(() => releaseAll(options), /校验 DMG.*9/);
          assert.equal(readFileSync(join(releaseDirectory, 'exts-chrome.zip'), 'utf8'), 'old-zip');
          assert.equal(readFileSync(join(releaseDirectory, 'exts-mac.dmg'), 'utf8'), 'old-dmg');
          assert.deepEqual(readdirSync(releaseDirectory).sort(), ['exts-chrome.zip', 'exts-mac.dmg']);
        } else {
          const output = releaseAll(options);
          assert.equal(output.version, version);
          assert.equal(output.zipPath, join(releaseDirectory, 'exts-chrome.zip'));
          assert.equal(output.dmgPath, join(releaseDirectory, 'exts-mac.dmg'));
          assert.equal(readFileSync(output.zipPath, 'utf8'), 'zip-fixture');
          assert.equal(readFileSync(output.dmgPath, 'utf8'), 'dmg-fixture');
          assert.equal(readdirSync(releaseDirectory).length, 2);
        }
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  }
});
