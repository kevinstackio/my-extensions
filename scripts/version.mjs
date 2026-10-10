import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryDirectory = fileURLToPath(new URL('..', import.meta.url));

export function validateProjectVersion(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) {
    throw new Error('根 package.json 的版本必须是三段数字，主版本大于零，不含前导零或预发布后缀');
  }
  const [major, minor, patch] = value.split('.').map(Number);
  if (major > 9999 || minor > 99 || patch > 99) {
    throw new Error('产品版本超出共同平台范围：主版本最多四位，次版本与修订版本最多两位');
  }
  return value;
}

export function readProjectVersion(expectedVersion = process.env.EXTS_BUILD_VERSION) {
  let metadata;
  try {
    metadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  } catch (cause) {
    throw new Error('无法读取根 package.json 的产品版本', { cause });
  }
  const version = validateProjectVersion(metadata.version);
  // 传递值只用于发现构建期间的版本变化，不能覆盖唯一版本源。
  if (expectedVersion !== undefined && expectedVersion !== version) {
    throw new Error(`构建版本与根版本不一致：${expectedVersion} / ${version}`);
  }
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(readProjectVersion());
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
