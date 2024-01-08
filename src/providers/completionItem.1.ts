import { relative } from 'path';
import type { CompletionItemProvider, ExtensionContext, } from 'vscode';
import { CompletionItem, languages } from 'vscode';

import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/provider';
import { I18nDbPaser } from 'models/i18nDbParser';
import { I18nGenTemplate, } from 'models/i18nGenTemplate';
import { getGlobalConfiguration } from 'utils/conf';
import { isSubPath, } from 'utils/path';
import { getWrokspaceFloder } from 'utils/path.code';
import { format } from 'prettier';

/**
 * 使用正则无法匹配到，目前不了解是什么原因, 正则如下 /\).*?$/  本来应该是可以匹配得到，在浏览器引擎等我都可以匹配得到，但在 extension 中事实上却无法被匹配
 * @param fnStr 
 * @returns 
 */
const getArgFromFnStr = (fnStr: string) => {
    const startBracketIndex = fnStr.indexOf('(');
    const endBracketIndex = fnStr.lastIndexOf(')');
    return fnStr.substring(startBracketIndex + 1, endBracketIndex);
};

const completionItemProvider: CompletionItemProvider = {
    async provideCompletionItems(document, position, token, context) {
        const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
        const genModals = i18nGenTemplate.getI18nTemplateModalsWhenCodeTextIsSameCaller(document, position);
        if (!Array.isArray(genModals) || !genModals.length) {
            return;
        }
        const config = await getGlobalConfiguration();
        const workfloder = await getWrokspaceFloder({
            multiplySelect: 'default',
        });
        const { i18nDirList, } = config;
        const i18nDbParser = new I18nDbPaser(config, workfloder);
        const i18nTypeKey = i18nDbParser.getLangEnumValue();
        const langMap = await i18nDbParser.getLangAboutI18nDirListMap();
        const lang = langMap[i18nTypeKey];
        if (!Array.isArray(lang) || !lang.length) {
            return;
        }

        const i18KeyMsgList = i18nDbParser.getI18nKeyAndValueFromSaveJsonItem(lang);
        const completionItems = i18KeyMsgList.flatMap(item => {
            const [id, msg, saveItem] = item;
            return genModals
                .map<CompletionItem>(modal => {
                    const renderTemplate = modal.renderI18nTemplate({ id, msg });
                    return {
                        label: msg,
                        documentation: [
                            `path: ${relative(i18nDirList.find(item => isSubPath(item.originalPath, saveItem.path))?.originalPath || '', saveItem.path,)};`,
                            `template: ${modal.template};`,
                            `renderTemplate: ${renderTemplate};`,
                        ].join('\r\n'),
                        insertText: renderTemplate
                    };
                });
        }).filter(Boolean);
        return Promise.all(
            completionItems.map(item => {
                if (item.insertText && typeof item.insertText === 'string') {
                    const formatPromise = format(item.insertText, { parser: 'typescript' })
                    .then(insertText => ({
                        ...item,
                        insertText: getArgFromFnStr(insertText),
                    }));
                    return formatPromise;
                }   
                return item;                         

            })
        );

    },
};

export const createI18nCompetionItemProvider = (context: ExtensionContext) => {
    return languages.registerCompletionItemProvider(SUPPORT_DOCUMENT_SELECTOR, completionItemProvider, '(',);
};