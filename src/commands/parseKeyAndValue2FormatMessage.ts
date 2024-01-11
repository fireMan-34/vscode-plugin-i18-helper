import vscode from 'vscode';

import { CMD_KEY } from 'constants/index';
import { I18nGenTemplate, } from 'models/index';
import type { ICommondItem } from 'types/index';
import { rangeFix } from 'utils/arr';
import { parseKeyAndValTexts2Object } from 'utils/code';
import { emptyWarningHandler } from 'utils/log';

/**
 * @description 解析键值对，创建代码到剪切板
* * 任务分解
* * 1. 获取选中代码 键值对 - [x]
* * 2. 映射快捷后代码 -[x]
* * 3. 映射到剪贴板 -[x]
 */
async function parseKeyAndValue2FormatMessage() {
  const editor = vscode.window.activeTextEditor;
  /** 获取键值对字符串数组 */
  function getKeyAndValLines() {
    if (!editor) {
      return [];
    }
    /** 当前文档对象 */
    const document = editor.document;
    /** 当前行对象 */
    const { selection } = editor;
    /** 起止行数 */
    const line = {
      start: selection.start.line,
      end: selection.end.line,
    };
    const rangeLine = rangeFix(line.start, line.end);
    return rangeLine.map(l => document.lineAt(l).text);
  }
  if (!editor) {
    emptyWarningHandler('活跃编辑器对象');
  };

  const keyAndValLines = getKeyAndValLines();
  const i18nObject: Record<string, string> = keyAndValLines.reduce((obj, keyAndValueLine) => {
    const o = parseKeyAndValTexts2Object(keyAndValueLine);
    return Object.assign(obj, o);
  }, {});
  const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
  const formatMessage = await Promise.all(Object
    .entries(i18nObject)
    .map(([id, msg]) => i18nGenTemplate.renderI18nCode({id, msg}))).then((codes) => codes.filter(Boolean).join('\n'));


  const clipboard = vscode.env.clipboard;
  clipboard.writeText(formatMessage);
  vscode.window.showInformationMessage('国际化代码已经生成到剪切板');
}

/** 解析国际化 key value 转为 代码 */
const item: ICommondItem = {
  cmd: CMD_KEY.PARSE_KEY_AND_VALUE2_FORMAT_MESSAGE_CMD,
  cmdExcuter: parseKeyAndValue2FormatMessage,
};

export default item;