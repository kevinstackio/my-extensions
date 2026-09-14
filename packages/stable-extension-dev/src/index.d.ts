import type { BuildOutput, Wxt } from 'wxt';

/** 可替换的文件系统边界，用于测试复制、替换和权限异常。 */
export interface StableBuildFileSystem {
  cp(
    source: string,
    destination: string,
    options: { force: boolean; recursive: boolean },
  ): Promise<void>;
  lstat(path: string): Promise<{
    isDirectory(): boolean;
    isFile(): boolean;
  }>;
  mkdir(path: string, options: { recursive: boolean }): Promise<void>;
  readFile(path: string, encoding: 'utf8'): Promise<string>;
  rename(source: string, destination: string): Promise<void>;
  rm(
    path: string,
    options: {
      force: boolean;
      maxRetries?: number;
      recursive: boolean;
      retryDelay?: number;
    },
  ): Promise<void>;
}

/** 发布一次稳定构建所需的源目录、目标目录和必需文件。 */
export interface PublishStableBuildOptions {
  fileSystem?: StableBuildFileSystem;
  requiredFiles?: string[];
  sourceDir: string;
  targetDir: string;
}

/** 稳定目录发布结果；备份目录只在旧版本清理失败时返回。 */
export interface PublishStableBuildResult {
  backupDir?: string;
  targetDir: string;
}

/** 构建产物校验或稳定目录替换失败时抛出的错误。 */
export class StableDevelopmentError extends Error {
  code?: string;
}

/** 校验并安全发布一份完整构建，失败时保留旧稳定目录。 */
export function publishStableBuild(
  options: PublishStableBuildOptions,
): Promise<PublishStableBuildResult>;

/** 配置稳定目录名称后缀。 */
export interface StableDevelopmentHookOptions {
  suffix?: string;
}

/** 创建仅在 WXT 开发命令中发布稳定目录的构建钩子。 */
export function createStableDevelopmentHooks(
  options?: StableDevelopmentHookOptions,
): {
  'build:done': (wxt: Wxt, output: Readonly<BuildOutput>) => Promise<void>;
};
