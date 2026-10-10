import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import * as release from '../scripts/release.mjs';
import { readProjectVersion } from '../scripts/version.mjs';

test('扩展打包生成真实 ZIP，根 Manifest 和入口内容完整，再次打包安全替换旧包', () => {
  assert.equal(typeof release.releaseExtension, 'function');
  const root = mkdtempSync(join(tmpdir(), 'exts-chrome-'));
  try {
    const extensionDir = join(root, 'build');
    const releaseDirectory = join(root, 'release');
    mkdirSync(extensionDir);
    writeFileSync(join(extensionDir, 'manifest.json'), JSON.stringify({ name: 'Exts', manifest_version: 3, version: readProjectVersion(), chrome_url_overrides: { newtab: 'newtab.html' }, icons: { 16: '/icon.png' } }));
    writeFileSync(join(extensionDir, 'icon.png'), 'fixture');
    writeFileSync(join(extensionDir, 'newtab.html'), '<html>首版扩展</html>');
    const output = release.releaseExtension({ extensionDir, releaseDirectory, build() {} });
    assert.equal(output.zipPath, join(releaseDirectory, 'exts-chrome.zip'));
    assert(existsSync(output.zipPath));
    const archive = process.platform === 'win32'
      ? spawnSync('tar', ['-tf', output.zipPath], { encoding: 'utf8' })
      : spawnSync('unzip', ['-Z1', output.zipPath], { encoding: 'utf8' });
    assert.equal(archive.status, 0, archive.stderr);
    assert(archive.stdout.split(/\r?\n/).includes('manifest.json'));
    assert(archive.stdout.split(/\r?\n/).includes('newtab.html'));
    const entry = process.platform === 'win32'
      ? spawnSync('tar', ['-xOf', output.zipPath, 'newtab.html'], { encoding: 'utf8' })
      : spawnSync('unzip', ['-p', output.zipPath, 'newtab.html'], { encoding: 'utf8' });
    assert.equal(entry.status, 0, entry.stderr);
    assert.equal(entry.stdout, '<html>首版扩展</html>');
    writeFileSync(join(extensionDir, 'newtab.html'), '<html>重新打包</html>');
    const updated = release.releaseExtension({ extensionDir, releaseDirectory, build() {} });
    assert.equal(updated.zipPath, output.zipPath);
    const content = process.platform === 'win32'
      ? spawnSync('tar', ['-xOf', updated.zipPath, 'newtab.html'], { encoding: 'utf8' })
      : spawnSync('unzip', ['-p', updated.zipPath, 'newtab.html'], { encoding: 'utf8' });
    assert.equal(content.status, 0, content.stderr);
    assert.equal(content.stdout, '<html>重新打包</html>');
    assert.deepEqual(readdirSync(releaseDirectory), [output.zipPath.split(/[\\/]/).at(-1)]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('版本错误、缺失入口与打包失败都不留下正式附件', () => {
  assert.equal(typeof release.releaseExtension, 'function');
  const root = mkdtempSync(join(tmpdir(), 'exts-chrome-invalid-'));
  try {
    const extensionDir = join(root, 'build');
    const releaseDirectory = join(root, 'release');
    mkdirSync(extensionDir);
    const manifestPath = join(extensionDir, 'manifest.json');
    const manifest = { name: 'Exts', manifest_version: 3, version: readProjectVersion(), chrome_url_overrides: { newtab: 'newtab.html' } };
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: '9999.0.0' }));
    assert.throws(() => release.releaseExtension({ extensionDir, releaseDirectory, build() {} }), /Manifest/);
    writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.throws(() => release.releaseExtension({ extensionDir, releaseDirectory, build() {} }), /入口/);
    writeFileSync(join(extensionDir, 'newtab.html'), '<html></html>');
    assert.throws(() => release.releaseExtension({ extensionDir, releaseDirectory, build() {}, run() { return { status: 7 }; } }), /失败/);
    assert.deepEqual(readdirSync(releaseDirectory), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
