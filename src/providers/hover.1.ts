import { HoverProvider, Hover, languages, MarkdownString, TextDocument, Position, Range, Uri } from 'vscode';

import { I18nGenTemplate, } from 'models/i18nGenTemplate';
import { SUPPORT_DOCUMENT_SELECTOR, I18N_DESCRIPTION_MAP, } from 'constants/index';
import { getGlobalConfiguration,  } from 'utils/conf';
import { getWrokspaceFloder } from 'utils/path.code';
import { I18nType } from 'types/index';
import { I18nDbPaser } from 'models/i18nDbParser';

const hoverProvider: HoverProvider = {
    async provideHover(document, position, token) {
        try {
            const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
            const i18nId = await i18nGenTemplate.getI18nIdFromDocumentPosition(document,position);
            const mayMsgResult = await i18nGenTemplate.getI18nMsgFromDocumentPosition(document, position);
            const mayVaribleResult = await i18nGenTemplate.getI18nVariableFromDocumentPosition(document, position);
            if (!i18nId) {
                return;
            }
            const globalConfig = await getGlobalConfiguration();
            const workspaceFolder = await getWrokspaceFloder({
                multiplySelect: 'matchActiveFile',
                matchPath: document.uri,
            });
            const i18nDbPaser = new I18nDbPaser(globalConfig, workspaceFolder);
            i18nDbPaser.prepareCheck();
            const i18nJsons = await i18nDbPaser.getCurrentI18nDirList();
            const allLangs = await i18nDbPaser.getLangTypesFromDB(i18nJsons);
            const i18nResult = await  i18nDbPaser.findKeyOrValue(i18nId, allLangs, 'key');
            const i18nInfoStr = allLangs
            .map(lang => {
                const out = i18nResult[lang];
                if (!out) {
                    return;
                }
                const [, value, item] = out;
                const i18nDescription = I18N_DESCRIPTION_MAP[item.i18nType];
                const path = Uri.file(item.path).toString();
                const strs = [
                  `- ${i18nDescription.name}:`,
                  `   - 翻译: ${value}`,
                  `   - 文件: [${item.path}](${path}) `,
                ];
                return strs.join('\n\n');
            }).filter(Boolean);
            const i18nType = I18nType[globalConfig.mainLanguage];
            const mainLanguageDefaultMsg = i18nResult[i18nType]?.[1];
            const mainLanguageText = `默认语言: ${I18N_DESCRIPTION_MAP[i18nType].name}`;
            const isEqualDefaultMsgCheckText = `默认语言编写检测: ${
                mainLanguageDefaultMsg
                ? mayMsgResult
                ? mainLanguageDefaultMsg === mayMsgResult
                ? '匹配正确'
                : '匹配不相等'
                : '该模板无需默认语言或当前模板匹配不到'
                : '默认语言翻译找不到'
            }`;
            const mainLangVaribles = mainLanguageDefaultMsg && i18nGenTemplate.matchMsgVariable(mainLanguageDefaultMsg);
            const variableCheckText = `国际化变量检测: ${
                mainLangVaribles
                ? mayVaribleResult
                ? mainLangVaribles.every((v) => mayVaribleResult.includes(v))
                ? '变量都已输入'
                : '缺失匹配变量  ' + mainLangVaribles.filter(v => !mayVaribleResult.includes(v)).join(',')
                : '未书写变量'
                : '无需书写变量'
            }`;
            return new Hover(new MarkdownString([
                mainLanguageText, 
                isEqualDefaultMsgCheckText ,
                variableCheckText,
                ...i18nInfoStr,
            ].join('\n\n')));
        } catch (error) {
            console.error(error);
        }
    },
};

export default function createAstHoverProvider(){
    return languages.registerHoverProvider(SUPPORT_DOCUMENT_SELECTOR, hoverProvider);
}