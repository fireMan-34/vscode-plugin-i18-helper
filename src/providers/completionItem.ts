import isEmpty from 'lodash/isEmpty';
import { relative } from 'path';
import type { CompletionItemProvider, ExtensionContext } from 'vscode';
import { CompletionItem, languages } from 'vscode';

import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/provider';
import { I18nTextParserClass, createMatchI18nFnPlugin } from 'models/index';
import { getProviderI18nJsonAndMainLanguage } from 'providers/helper';
import { I18nDirItem, I18nMetaJson } from 'types/index';
import { renderI18nCode } from 'utils/code';
import { thorwNewError } from 'utils/log';
import { getWrokspaceFloder } from 'utils/path.code';

/** @see http://blog.haoji.me/vscode-plugin-jump-completion-hover.html
 * * 步骤分解
 * 1. 匹配符合文本信息 -[x]
 * 2. 判断是否符合全局信息管理空间 -[x]
 * 3. 扫描对应文件 -[x]
 * 4. 生成对应运行时激活对象 -[x]
 * 5. 输出提示 -[x]
 * 6. 
 */
const I18nCompetionItemProvider: CompletionItemProvider = {
    async provideCompletionItems(document, position, token, context) {
        try {
            const i18nTextParser = new I18nTextParserClass(document, position);
            createMatchI18nFnPlugin(i18nTextParser);
            const matchVal = i18nTextParser.getMatchI18nText();

            if (matchVal) {
                const documnetUrl = document.uri.fsPath;
                const currentWorkspaceFolder = await getWrokspaceFloder({
                    multiplySelect: 'matchI18n',
                    matchI18nPath: documnetUrl,
                });
                const {
                    runTimeVersion,
                    i18nDirJsons,
                    mainLanguage,
                    matchI18nDirList,
                } = await getProviderI18nJsonAndMainLanguage(currentWorkspaceFolder);

                if (isEmpty(matchI18nDirList)) {
                    throw thorwNewError('全局配置匹配不到此工作区文件夹', RangeError);
                }

                const i18nContents = i18nDirJsons.flatMap(getI18nList);

                function getI18nList(metaJson: I18nMetaJson & I18nDirItem) {
                    return metaJson
                        .saveContent[mainLanguage]
                        .flatMap(i18nItem =>
                            Object.entries(i18nItem.content)
                                .map<CompletionItem>((([id, msg]) => ({
                                    label: msg,
                                    detail: relative(metaJson.originalPath, i18nItem.path),
                                    documentation: i18nItem.path,
                                    insertText: renderI18nCode({ id, msg, isRemoveBrace: true, isRemoveBracket: true }),
                                })))
                        );
                };

                return i18nContents;
            }
            return [];
        } catch (err) {
            console.error(err);
        };

    },
    /** 光标选中自动补全 */
    resolveCompletionItem(item, token) {
        return null;
    },
};

/** 创建国际化智能提示 */
export const createI18nCompetionItemProvider = (context: ExtensionContext) => {
    return languages.registerCompletionItemProvider(SUPPORT_DOCUMENT_SELECTOR, I18nCompetionItemProvider, `{`, '(',);
};