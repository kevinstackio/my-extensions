import { randomUUID } from 'node:crypto';
import {
  cp,
  lstat,
  mkdir,
  readFile,
  rename,
  rm,
} from 'node:fs/promises';
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';

const nodeFileSystem = {
  cp,
  lstat,
  mkdir,
  readFile,
  rename,
  rm,
};

export class StableDevelopmentError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'StableDevelopmentError';
    this.code = cause?.code;
  }
}

export async function publishStableBuild({
  sourceDir,
  targetDir,
  requiredFiles = [],
  fileSystem = nodeFileSystem,
}) {
  const sourcePath = resolve(sourceDir);
  const targetPath = resolve(targetDir);

  if (sourcePath === targetPath) {
    throw new StableDevelopmentError('源构建目录和稳定目录不能相同');
  }

  const normalizedRequiredFiles = normalizeRequiredFiles(requiredFiles);
  await validateBuild(sourcePath, normalizedRequiredFiles, fileSystem);

  const stagingPath = `${targetPath}.staging-${randomUUID()}`;
  const backupPath = `${targetPath}.backup-${randomUUID()}`;
  let stagingExists = false;
  let backupExists = false;

  try {
    await fileSystem.mkdir(dirname(targetPath), { recursive: true });
    await fileSystem.rm(stagingPath, { recursive: true, force: true });
    await fileSystem.cp(sourcePath, stagingPath, {
      recursive: true,
      force: true,
    });
    stagingExists = true;
    await validateBuild(stagingPath, normalizedRequiredFiles, fileSystem);

    if (await pathExists(targetPath, fileSystem)) {
      try {
        await fileSystem.rename(targetPath, backupPath);
        backupExists = true;
      } catch (error) {
        throw new StableDevelopmentError(
          `稳定开发产物替换失败（${error?.code ?? 'unknown'}）：无法暂存旧目录`,
          error,
        );
      }
    }

    try {
      await fileSystem.rename(stagingPath, targetPath);
      stagingExists = false;
    } catch (error) {
      if (backupExists) {
        try {
          await fileSystem.rename(backupPath, targetPath);
          backupExists = false;
        } catch (restoreError) {
          throw new StableDevelopmentError(
            `稳定开发产物替换失败（${error?.code ?? 'unknown'}），旧目录仍保留在 ${backupPath}`,
            restoreError,
          );
        }
      }

      throw new StableDevelopmentError(
        `稳定开发产物替换失败（${error?.code ?? 'unknown'}）：无法安装新目录`,
        error,
      );
    }

    if (backupExists) {
      try {
        await fileSystem.rm(backupPath, {
          recursive: true,
          force: true,
          maxRetries: 3,
          retryDelay: 100,
        });
        backupExists = false;
      } catch {
        backupExists = true;
      }
    }

    return {
      targetDir: targetPath,
      backupDir: backupExists ? backupPath : undefined,
    };
  } finally {
    if (stagingExists) {
      await removeTemporaryDirectory(stagingPath, fileSystem);
    }
  }
}

export function createStableDevelopmentHooks({ suffix = '-stable' } = {}) {
  if (!suffix || suffix.includes('/') || suffix.includes('\\')) {
    throw new StableDevelopmentError('稳定目录后缀必须是单一目录名片段');
  }

  return {
    'build:done': async (wxt, output) => {
      if (wxt.config.command !== 'serve') return;

      const requiredFiles = [
        'manifest.json',
        ...(output?.publicAssets ?? []).map(asset => asset.fileName),
        ...(output?.steps ?? []).flatMap(step =>
          (step.chunks ?? []).map(chunk => chunk.fileName),
        ),
      ];
      const result = await publishStableBuild({
        sourceDir: wxt.config.outDir,
        targetDir: `${wxt.config.outDir}${suffix}`,
        requiredFiles,
      });

      wxt.logger?.info?.(
        `稳定开发产物已发布到 ${relative(process.cwd(), result.targetDir)}`,
      );
    },
  };
}

function normalizeRequiredFiles(requiredFiles) {
  const files = new Set(['manifest.json']);

  for (const file of requiredFiles) {
    if (typeof file !== 'string') {
      throw new StableDevelopmentError('必需构建文件路径必须是字符串');
    }

    const normalized = file.replaceAll('\\', '/').replace(/^\.\//, '');
    if (
      !normalized ||
      isAbsolute(file) ||
      normalized.startsWith('/') ||
      /^[A-Za-z]:\//.test(normalized) ||
      normalized.split('/').includes('..')
    ) {
      throw new StableDevelopmentError(`非法必需构建文件路径：${file}`);
    }

    files.add(normalized);
  }

  return [...files];
}

async function validateBuild(directory, requiredFiles, fileSystem) {
  const directoryStat = await getStat(directory, fileSystem, `构建目录不存在：${directory}`);
  if (!directoryStat.isDirectory()) {
    throw new StableDevelopmentError(`构建路径不是目录：${directory}`);
  }

  for (const file of requiredFiles) {
    const filePath = join(directory, file);
    const fileStat = await getStat(
      filePath,
      fileSystem,
      `构建产物缺少必需文件：${file}`,
    );
    if (!fileStat.isFile()) {
      throw new StableDevelopmentError(`构建产物不是普通文件：${file}`);
    }
  }

  let manifest;
  try {
    manifest = JSON.parse(
      await fileSystem.readFile(join(directory, 'manifest.json'), 'utf8'),
    );
  } catch (error) {
    throw new StableDevelopmentError(
      `构建产物中的 manifest.json 无法读取或解析`,
      error,
    );
  }

  if (
    !manifest ||
    Array.isArray(manifest) ||
    ![2, 3].includes(manifest.manifest_version) ||
    typeof manifest.name !== 'string' ||
    !manifest.name.trim() ||
    typeof manifest.version !== 'string' ||
    !manifest.version.trim()
  ) {
    throw new StableDevelopmentError('构建产物中的 manifest.json 字段不完整');
  }
}

async function pathExists(path, fileSystem) {
  try {
    await fileSystem.lstat(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function getStat(path, fileSystem, message) {
  try {
    return await fileSystem.lstat(path);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new StableDevelopmentError(message, error);
    }
    throw error;
  }
}

async function removeTemporaryDirectory(path, fileSystem) {
  try {
    await fileSystem.rm(path, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  } catch {
    return;
  }
}
