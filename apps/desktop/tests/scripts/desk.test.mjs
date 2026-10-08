import assert from 'node:assert/strict';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { runDesk } from '../../scripts/desk.mjs';

test('非 macOS 明确提示并在运行工具前退出', () => {
  const messages = [];
  const status = runDesk('dev', {
    platform: 'win32',
    run() { assert.fail('非 macOS 不应执行任何工具'); },
    report(message) { messages.push(message); },
  });
  assert.equal(status, 1);
  assert.match(messages[0], /桌面应用需要在 macOS 上运行和构建/);
});

test('macOS 工具缺失时给出提示且不执行构建', async (context) => {
  for (const missing of ['xcodebuild', 'xcodegen']) {
    await context.test(missing, () => {
      const messages = [];
      const status = runDesk('build', {
        platform: 'darwin',
        run(command) {
          assert.notEqual(command, '/bin/zsh');
          return command === missing ? { error: new Error('ENOENT'), status: null } : { status: 0 };
        },
        report(message) { messages.push(message); },
      });
      assert.equal(status, 1);
      assert.ok(messages.some((message) => message.includes(missing)));
    });
  }
});

test('dev 和 build 在应用目录执行对应模式', async (context) => {
  const projectDirectory = fileURLToPath(new URL('../..', import.meta.url));
  for (const mode of ['dev', 'build']) {
    await context.test(mode, () => {
      const calls = [];
      const status = runDesk(mode, {
        platform: 'darwin',
        run(command, args, options) { calls.push({ command, args, options }); return { status: 0 }; },
        report() { assert.fail('成功运行不应报错'); },
      });
      assert.equal(status, 0);
      assert.deepEqual(calls.slice(0, 2).map((call) => call.command), ['xcodebuild', 'xcodegen']);
      const build = calls[2];
      assert.equal(build.command, '/bin/zsh');
      assert.equal(basename(build.args[0]), 'build.sh');
      assert.equal(basename(dirname(build.args[0])), 'scripts');
      assert.equal(build.args[1], mode);
      assert.equal(build.options.cwd, projectDirectory);
      assert.equal(build.options.stdio, 'inherit');
    });
  }
});

test('构建失败时透传原生退出码', () => {
  const status = runDesk('build', {
    platform: 'darwin',
    run(command) { return { status: command === '/bin/zsh' ? 65 : 0 }; },
    report() {},
  });
  assert.equal(status, 65);
});
