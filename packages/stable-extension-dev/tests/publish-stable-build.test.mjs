import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createStableDevelopmentHooks,
  publishStableBuild,
} from '../src/index.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'stable-extension-dev-'));
  temporaryDirectories.push(root);

  const sourceDir = join(root, 'chrome-mv3-dev');
  const targetDir = join(root, 'chrome-mv3-dev-stable');
  await writeFile(
    join(await createDirectory(sourceDir), 'manifest.json'),
    JSON.stringify({
      manifest_version: 3,
      name: 'Fixture extension',
      version: '1.0.0',
    }),
  );
  await writeFile(join(sourceDir, 'background.js'), 'console.log("new");');
  await createDirectory(targetDir);
  await writeFile(join(targetDir, 'manifest.json'), 'old-manifest');
  await writeFile(join(targetDir, 'background.js'), 'console.log("old");');

  return { root, sourceDir, targetDir };
}

async function createDirectory(directory) {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(directory, { recursive: true });
  return directory;
}

describe('publishStableBuild', () => {
  it('publishes a complete build and removes temporary swap directories', async () => {
    const { root, sourceDir, targetDir } = await createFixture();

    await publishStableBuild({
      sourceDir,
      targetDir,
      requiredFiles: ['background.js'],
    });

    expect(await readFile(join(targetDir, 'manifest.json'), 'utf8')).toContain(
      'Fixture extension',
    );
    expect(await readFile(join(targetDir, 'background.js'), 'utf8')).toContain(
      'new',
    );
    expect(
      (await readdir(dirname(targetDir))).filter(name =>
        name.includes('.stable-extension-dev-'),
      ),
    ).toEqual([]);
    expect(await readdir(root)).toEqual(
      expect.arrayContaining(['chrome-mv3-dev', 'chrome-mv3-dev-stable']),
    );
  });

  it('rejects an invalid manifest without changing the previous stable build', async () => {
    const { sourceDir, targetDir } = await createFixture();
    await writeFile(join(sourceDir, 'manifest.json'), '{invalid');

    await expect(
      publishStableBuild({
        sourceDir,
        targetDir,
        requiredFiles: ['background.js'],
      }),
    ).rejects.toThrow('manifest.json');

    expect(await readFile(join(targetDir, 'manifest.json'), 'utf8')).toBe(
      'old-manifest',
    );
    expect(await readFile(join(targetDir, 'background.js'), 'utf8')).toContain(
      'old',
    );
  });

  it('rejects incomplete output without changing the previous stable build', async () => {
    const { sourceDir, targetDir } = await createFixture();
    await rm(join(sourceDir, 'background.js'));

    await expect(
      publishStableBuild({
        sourceDir,
        targetDir,
        requiredFiles: ['background.js'],
      }),
    ).rejects.toThrow('background.js');

    expect(await readFile(join(targetDir, 'background.js'), 'utf8')).toContain(
      'old',
    );
  });

  it('preserves the previous stable build when copying fails', async () => {
    const { sourceDir, targetDir } = await createFixture();
    const fs = await import('node:fs/promises');

    await expect(
      publishStableBuild({
        sourceDir,
        targetDir,
        requiredFiles: ['background.js'],
        fileSystem: {
          ...fs,
          cp: async () => {
            throw new Error('copy failed');
          },
        },
      }),
    ).rejects.toThrow('copy failed');

    expect(await readFile(join(targetDir, 'manifest.json'), 'utf8')).toBe(
      'old-manifest',
    );
  });

  it('preserves the previous stable build when Windows refuses replacement', async () => {
    const { sourceDir, targetDir } = await createFixture();
    const fs = await import('node:fs/promises');
    const absoluteTargetDir = resolve(targetDir);

    await expect(
      publishStableBuild({
        sourceDir,
        targetDir,
        requiredFiles: ['background.js'],
        fileSystem: {
          ...fs,
          rename: async (from, to) => {
            if (resolve(from) === absoluteTargetDir) {
              const error = new Error('access denied');
              error.code = 'EPERM';
              throw error;
            }
            return fs.rename(from, to);
          },
        },
      }),
    ).rejects.toThrow('EPERM');

    expect(await readFile(join(targetDir, 'manifest.json'), 'utf8')).toBe(
      'old-manifest',
    );
  });
});

describe('createStableDevelopmentHooks', () => {
  it('publishes serve output to the stable sibling directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'stable-extension-dev-hook-'));
    temporaryDirectories.push(root);
    const sourceDir = join(root, 'chrome-mv3-dev');
    await createDirectory(sourceDir);
    await writeFile(
      join(sourceDir, 'manifest.json'),
      JSON.stringify({
        manifest_version: 3,
        name: 'Hook fixture',
        version: '1.0.0',
      }),
    );
    await writeFile(join(sourceDir, 'background.js'), 'console.log("hook");');

    const hooks = createStableDevelopmentHooks();
    await hooks['build:done'](
      {
        config: { command: 'serve', outDir: sourceDir },
        logger: { info() {} },
      },
      {
        publicAssets: [],
        steps: [{ chunks: [{ type: 'chunk', fileName: 'background.js' }] }],
      },
    );

    expect(
      await readFile(join(root, 'chrome-mv3-dev-stable', 'background.js'), 'utf8'),
    ).toContain('hook');
  });

  it('does not publish production build output', async () => {
    const root = await mkdtemp(join(tmpdir(), 'stable-extension-dev-prod-'));
    temporaryDirectories.push(root);
    const sourceDir = join(root, 'chrome-mv3');
    await createDirectory(sourceDir);

    const hooks = createStableDevelopmentHooks();
    await hooks['build:done'](
      {
        config: { command: 'build', outDir: sourceDir },
        logger: { info() {} },
      },
      { publicAssets: [], steps: [] },
    );

    await expect(
      readFile(join(root, 'chrome-mv3-stable', 'manifest.json'), 'utf8'),
    ).rejects.toThrow();
  });
});
