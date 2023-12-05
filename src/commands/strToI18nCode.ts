import isEmpty from "lodash/isEmpty";
import { env, window, } from 'vscode';
import type { ExtensionContext, } from 'vscode';

import { CMD_KEY } from 'constants/index';
import { I18nType, type I18nMetaJson, type ICommondItem, GeneratedCodeFromStrMode, } from 'types/index';
import { getGlobalConfiguration } from 'utils/conf';
import { readJsonFile } from "utils/fs";
import { isSamePath } from "utils/path";
import { renderI18nCode } from 'utils/code';
import { getWrokspaceFloder, } from 'utils/path.code';

/** 文本转国际化代码 */
const strToi18nCode = async (context: ExtensionContext, str: string, mode?: GeneratedCodeFromStrMode) => {
  if (!str) {
    return;
  };
  const workfloder = await getWrokspaceFloder({ multiplySelect: 'default' });
  if (!workfloder) {
    return;
  }
  const { 
    i18nDirList, 
    mainLanguage,
    generatedCodeFromStrMode,
  } = await getGlobalConfiguration();
  const commandMode = mode ?? generatedCodeFromStrMode;
  if (commandMode === GeneratedCodeFromStrMode.none) {
    return;
  }
  const currentI18nDirList = i18nDirList.filter((item) => isSamePath(item.projectPath, workfloder.uri.fsPath));
  if (isEmpty(currentI18nDirList)) {
    return;
  }
  const currentI18nJSONList = await Promise.all(currentI18nDirList.map((item => readJsonFile<I18nMetaJson>(item.targetPath))));
  /** 国际化 key value */
  const currentContentList = currentI18nJSONList.flatMap((item) => item.saveContent[I18nType[mainLanguage]]).flatMap(item => Object.entries(item.content));
  const item = currentContentList.find(([key, val]) =>key === str || val === str);
  if (!item) {
    return;
  }
  if (commandMode === GeneratedCodeFromStrMode.ask) {
    const result  = await window.showQuickPick([ '是', '否' ], {
      title: '检测到可识别的国际化字符串，是否需要帮你转换到剪切板中',
    });
    if (result === '否' || !result) {
      return;
    }
  } else {
    window.showInformationMessage('检测到可识别的国际化字符串，已为你转换成动态模板对应的代码');
  }
  const [ id, msg ] = item;
  const newCode = renderI18nCode({ id, msg });
  env.clipboard.writeText(newCode);
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: CMD_KEY.STR_TO_I18N_CODE,
  cmdExcuter: strToi18nCode,
};
export default item;