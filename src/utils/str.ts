import type { ExtensionContext } from 'vscode';
import { createHash } from 'crypto';
import { join } from 'path';
import type { XTextEditor } from 'types/index';
import { generatDirPathIfNone } from 'utils/fs';

/*** 获取运行时目录的子目录 */
export const getRuntimePath = (context: ExtensionContext | { extension: { extensionPath: string } } , ...paths: string[]) => {
  const { extensionPath } = context.extension;
  const RUN_TIME_DIR_NAME = '.i18n';
  const RUN_TIME_PATH = join(extensionPath, RUN_TIME_DIR_NAME);

  generatDirPathIfNone(RUN_TIME_DIR_NAME);

  return join(RUN_TIME_PATH, ...paths);
};

/** 生成唯一运行时唯一 hash 路径 */
export function generateRuntimeProjectI18nHashPath (context: ExtensionContext ,editor: XTextEditor) {
  /** 只能调用一次 digest */
  const SHA_256_HASH = createHash('sha256');
  const I18nDirPath = editor.fsPath;
  const runtimePath = getRuntimePath(context);
  const runtimeHashPath = join(runtimePath, SHA_256_HASH.update(I18nDirPath).digest('hex'));

  generatDirPathIfNone(runtimeHashPath);

  return runtimeHashPath;
};

/** 获取运行时路径配置 */
export function getRunTimeConfigPath(context: ExtensionContext) {
  return getRuntimePath(context, 'config.json');
}