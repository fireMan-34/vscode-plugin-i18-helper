import type { ExtensionContext, Uri } from 'vscode';
import { createHash } from 'crypto';
import { join, sep, relative, isAbsolute, win32, } from 'path';
import { existsSync } from 'fs';
import range from 'lodash/range';
import { generatDirPathIfNone, saveJsonFileSync } from 'utils/fs';
import { PROJECT_META_JSON } from 'constants/index';

/*** 获取运行时目录的子目录 */
export const getRuntimePath = (context: ExtensionContext | { extension: { extensionPath: string } }, ...paths: string[]) => {
  const { extensionPath } = context.extension;
  const RUN_TIME_DIR_NAME = '.i18n';
  const RUN_TIME_PATH = join(extensionPath, RUN_TIME_DIR_NAME);
  const RUN_TIME_CHILD_PATH = join(RUN_TIME_PATH, ...paths);

  generatDirPathIfNone(RUN_TIME_PATH);

  return RUN_TIME_CHILD_PATH;
};

/** 生成唯一运行时唯一 hash 路径 */
export function generateRuntimeProjectI18nHashPath(context: ExtensionContext, uri: Uri) {
  /** 只能调用一次 digest */
  const SHA_256_HASH = createHash('sha256');
  const I18nDirPath = uri.fsPath;
  const runtimePath = getRuntimePath(context);
  const runtimeHashPath = join(runtimePath, SHA_256_HASH.update(I18nDirPath).digest('hex'));

  generatDirPathIfNone(runtimeHashPath);

  return runtimeHashPath;
};

/** 获取运行时路径配置 */
export function getRunTimeConfigPath(context: ExtensionContext) {
  const RUN_TIME_CONFIG_PATH = getRuntimePath(context, 'config.json');

  if (!existsSync(RUN_TIME_CONFIG_PATH)) {
    saveJsonFileSync(RUN_TIME_CONFIG_PATH, PROJECT_META_JSON);
  }

  return RUN_TIME_CONFIG_PATH;
}

/** 路径相似性算法， 目前一一映射 不做乱序处理 */
export function getPathSameVal(path1: string, path2: string): number {
  const path1Sep = path1.split(sep);
  const path2Sep = path2.split(sep);
  const minCount = Math.min(path1Sep.length, path2Sep.length);
  return range(0, minCount).reduce((count, index) => {
    if (path1Sep[index] === path2Sep[index]) {
      return count + 1;
    }
    return count;
  }, 0);
};

/** 判断是否是子路径 */
export function isSubPath(parentPath: string, mayChildPath: string): boolean {
  const relativePath = relative(parentPath,  mayChildPath);
  return !!(relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath));
};

/** 判断是否是相同路径
 * @see http://www.nodejs.com.cn/api-v16/path.html#windows-vs-posix
 */
export function isSamePath(path1: string, path2: string): boolean {  
  return win32.normalize(path1) === win32.normalize(path2);
};

