/** @fileoverview 辅助函数 抽出相同逻辑函数 */

import type { WorkspaceFolder } from "vscode";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import isEmpty from "lodash/isEmpty";
import { GlobalExtensionSubject } from "utils/conf";
import { isSamePath } from "utils/path";
import { thorwNewError } from "utils/log";
import { I18nMetaJson, I18nType } from "types/index";
import { readJsonFile } from "utils/fs";
import { createRunTimeCahce } from 'utils/runtimeCache';

const providerComputeCache = createRunTimeCahce('provider');
let runTimeVersionNote: number;
let workspacePath: string;

/** 获取 i18n 相关数据 辅助提供上下文函数 */
export async function getProviderI18nJsonAndMainLanguage(folder: WorkspaceFolder) {
  const { i18nDirList, mainLanguage, runTimeVersion } = await firstValueFrom(GlobalExtensionSubject);

  const i18nType = I18nType[mainLanguage];
  const workspaceFolderPath = folder.uri.fsPath;

  const isUseCache = runTimeVersionNote && workspacePath && !providerComputeCache.clearWhile(runTimeVersionNote,
    runTimeVersionNote !== runTimeVersion
    || workspacePath !== workspaceFolderPath
  );

  if (isUseCache) {
    return providerComputeCache.getKey(runTimeVersionNote) as typeof ctx;
  }
  workspacePath = workspaceFolderPath;

  const matchI18nDirList = i18nDirList
    .filter((i18nItem) => isSamePath(i18nItem.projectPath, workspaceFolderPath));

  if (isEmpty(matchI18nDirList)) {
    throw thorwNewError('全局配置匹配不到此工作区文件夹', RangeError);
  }

  const i18nDirJsons = await Promise.all(matchI18nDirList
    .map((item =>
      readJsonFile<I18nMetaJson>(item.targetPath)
        .then((metaJson: I18nMetaJson) => ({ ...metaJson, ...item }))
    )));

  const i18nMainFileContents = i18nDirJsons.map((json => json.saveContent[i18nType])).flat();

  const ctx = {
    /** 运行版本 */
    runTimeVersion,
    /** 当前激活语言 */
    mainLanguage,
    /** 主语言相关枚举 */
    i18nType,
    /** 插件所有 i18n 扫描目录 */
    i18nDirList,
    /** 匹配当前工作区的语言 */
    matchI18nDirList,
    /** i18n 目录对应的文件数据 json */
    i18nDirJsons,
    /** i18n 主语言对应的文件数据 */
    i18nMainFileContents,
  };

  providerComputeCache.setKey(runTimeVersion, ctx);
  runTimeVersionNote = runTimeVersion;

  return ctx;
};