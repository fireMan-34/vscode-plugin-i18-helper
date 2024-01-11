import { relative, } from 'path';
import type { ExtensionContext, QuickPickItem } from "vscode";
import { SnippetString, window } from 'vscode';

import { CMD_KEY } from "constants/index";
import { I18nDbPaser, I18nGenTemplate, } from 'models/index';
import type { ICommondItem } from "types/index";
import { getGlobalConfiguration } from "utils/conf";
import { getWrokspaceFloder } from "utils/path.code";

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
    const i18nLangDirMap = await i18nDbParser.getLangAboutI18nDirListMap();
    const mainLanguageMap = i18nLangDirMap[mainLanguage];
    const keyAndValues = i18nDbParser.getI18nKeyAndValueFromSaveJsonItem(mainLanguageMap);
    const selectVal = await window.showQuickPick(keyAndValues.map<QuickPickItem & { value: [string, string] }>(([id, msg, item]) => ({
      label: msg,
      description: id,
      detail: relative(workfloder.uri.fsPath, item.path, ),
      value: [ id, msg ],
    })), { 
      title: '搜素主语言的国际化文本',
      placeHolder: '国际化的主语言的文本',
     });
     if (!selectVal) {
      return;
     };
    const [ id, msg ] = selectVal.value;
    const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
    const code = await i18nGenTemplate.renderI18nCode({ id, msg });
    if (!code) {
      return;
    }
    await activeTextEditor.insertSnippet(new SnippetString(code));
  }
}
const quickSearchI18n = new QuickSearchI18n();

export default quickSearchI18n;
