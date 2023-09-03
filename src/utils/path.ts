import type { ExtensionContext, WorkspaceFolder } from 'vscode';
import { workspace, window } from 'vscode';
import { createHash } from 'crypto';
import { join, normalize, sep, relative, isAbsolute, } from 'path';
import { existsSync } from 'fs';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import type { XTextEditor } from 'types/index';
import { generatDirPathIfNone, saveJsonFileSync } from 'utils/fs';
import { thorwNewError } from 'utils/log';
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
export function generateRuntimeProjectI18nHashPath(context: ExtensionContext, editor: XTextEditor) {
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

/** 判断是否是相同路径 */
export function isSamePath(path1: string, path2: string): boolean {
  return normalize(path1) === normalize(path2);
};

/** 检测 workfloder 是否不满足条件
 * 如果满足返回非空值类型
 */
export function checkWrokFloders(workspaceFolders: readonly WorkspaceFolder[] | undefined): readonly WorkspaceFolder[] {
  if (!workspaceFolders) {
    throw new Error('请添加文件夹到当前工作区');
  }
  return workspaceFolders;
};

/** 挑选工作目录 */
export function pickWrokspaceFolder(): Thenable<WorkspaceFolder> {
  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders);
  const quickPickFolderPromise = window.showQuickPick(workspaceFolders.map((item => item.name)),
    { placeHolder: '请选择扫描国际化项目目录', ignoreFocusOut: true });
  return quickPickFolderPromise
    .then((workspaceFolderName) => {
      const workfloder = workspaceFolders.find((folder => folder.name === workspaceFolderName));
      if (workfloder) {
        return workfloder;
      }
      throw new Error('找不到工作区间项目目录');
    });
}

/** 匹配相似目录，选取相似度最高的目录 */
export function matchI18nWorkspaceFolder(matchI18nPath: string) {
  const normalizeI18nPath = normalize(matchI18nPath);
  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders)
  .filter((folder) => isSubPath(folder.uri.fsPath, normalizeI18nPath));

  if (isEmpty(workspaceFolders)) {
    thorwNewError('当前工作区匹配不到此路径', RangeError);
  };

  const workspaceMatchFolder = workspaceFolders
    .map((item => ({ item, normailzePath: normalize(item.uri.fsPath) })))
    .map((item) => ({ ...item, sameVal: getPathSameVal(normalizeI18nPath, item.normailzePath) }))
    .reduce((acc, item) => acc.sameVal > item.sameVal ? acc : item ).item;
  return workspaceMatchFolder;
}

interface GetWrokspaceFloderOptions {
  /** 用户选择模式 , 首个模式  */
  multiplySelect?: 'pick' | 'default' | 'matchI18n',
  /** 需要匹配的路径国际化路径 */
  matchI18nPath?: string,
}

/** 获取激活的 workfloder
 * 
 */
export async function getWrokspaceFloder(options?: GetWrokspaceFloderOptions): Promise<WorkspaceFolder> {

  const { multiplySelect, matchI18nPath } = {
    multiplySelect: 'pick',
    ...options,
  } as GetWrokspaceFloderOptions;

  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders);

  const isOnly = workspaceFolders.length === 1;
  if (isOnly || multiplySelect === 'default') {
    return workspaceFolders[0];
  }

  const isUseMatchI18n = multiplySelect === 'matchI18n' && matchI18nPath;
  if (isUseMatchI18n) {
    return matchI18nWorkspaceFolder(matchI18nPath);
  }

  return pickWrokspaceFolder();

}