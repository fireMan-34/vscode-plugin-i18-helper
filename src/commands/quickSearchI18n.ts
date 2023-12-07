import type { ExtensionContext, QuickPickItem } from "vscode";
import { window, SnippetString } from 'vscode';
import { relative, } from 'path';

import { CMD_KEY } from "constants/index";
import { I18nDbPaser } from "models/index";
import type { ICommondItem } from "types/index";
import { I18nType, } from 'types/index';
import { getWrokspaceFloder } from "utils/path.code";
import { getGlobalConfiguration } from "utils/conf";
import { renderI18nCode, } from 'utils/code';

class QuickSearchI18n implements ICommondItem {
  cmd: string = CMD_KEY.QUICK_SEARCH_I18N;
  async cmdExcuter(context: ExtensionContext) {
    const { activeTextEditor, } = window;
    if (!activeTextEditor) {
      return;
    }
    const globalConfig = await getGlobalConfiguration();
    const workfloder = await getWrokspaceFloder({
      multiplySelect: "matchActiveFile",
    });
    const i18nDbParser = new I18nDbPaser(globalConfig, workfloder);
    await i18nDbParser.prepareCheck();
    const { mainLanguage, } = globalConfig;
    const mainLanguageKey = I18nType[mainLanguage];
    const i18nLangDirMap = await i18nDbParser.getLangAboutI18nDirListMap();
    const mainLanguageMap = i18nLangDirMap[mainLanguageKey];
    const keyAndValues = i18nDbParser.getI18nKeyAndValueFromSaveJsonItem(mainLanguageMap);
    const selectVal = await window.showQuickPick(keyAndValues.map<QuickPickItem & { value: string }>(([id, msg, item]) => ({
      label: msg,
      description: id,
      detail: relative(workfloder.uri.fsPath, item.path, ),
      value: msg,
    })), { 
      title: '搜素主语言的国际化文本',
      placeHolder: '国际化的主语言的文本',
     });
     if (!selectVal) {
      return;
     };
    const [ id, msg ] = keyAndValues.find(item => item[1] === selectVal.value)!;
    const code = renderI18nCode({ id, msg });
    await activeTextEditor.insertSnippet(new SnippetString(code));
  }
}
const quickSearchI18n = new QuickSearchI18n();

export default quickSearchI18n;
