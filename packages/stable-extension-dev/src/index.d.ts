import type { BuildOutput, Wxt } from 'wxt';

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

export interface PublishStableBuildOptions {
  fileSystem?: StableBuildFileSystem;
  requiredFiles?: string[];
  sourceDir: string;
  targetDir: string;
}

export interface PublishStableBuildResult {
  backupDir?: string;
  targetDir: string;
}

export class StableDevelopmentError extends Error {
  code?: string;
}

export function publishStableBuild(
  options: PublishStableBuildOptions,
): Promise<PublishStableBuildResult>;

export interface StableDevelopmentHookOptions {
  suffix?: string;
}

export function createStableDevelopmentHooks(
  options?: StableDevelopmentHookOptions,
): {
  'build:done': (wxt: Wxt, output: Readonly<BuildOutput>) => Promise<void>;
};
