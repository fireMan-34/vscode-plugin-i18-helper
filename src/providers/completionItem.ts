import { relative } from 'path';
import type { CompletionItemProvider, ExtensionContext } from 'vscode';
import { languages, CompletionItem } from 'vscode';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import isEmpty from 'lodash/isEmpty';
import { GlobalExtensionSubject } from 'utils/conf';
import { getWrokspaceFloder, isSamePath } from 'utils/path';
import { FORMAT_MESSAGE_REGEX } from 'utils/code';
import { thorwNewError } from 'utils/log';
import { readJsonFile } from 'utils/fs';
import { I18nMetaJson, I18nType, i18nDirItem } from 'types/index';
import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/provider';



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
            const line = document.lineAt(position);
            const lineText = line.text;
            if (FORMAT_MESSAGE_REGEX.test(lineText)) {
                const { i18nDirList, mainLanguage } = await firstValueFrom(GlobalExtensionSubject);
                const documnetUrl = document.uri.fsPath;
                const currentWorkspaceFolder = await getWrokspaceFloder({
                    multiplySelect: 'matchI18n',
                    matchI18nPath: documnetUrl,
                });
                const matchI18nDirList = i18nDirList.filter(i18nDir => isSamePath(i18nDir.projectPath, currentWorkspaceFolder.uri.fsPath));

                if (isEmpty(matchI18nDirList)) {
                    thorwNewError('全局配置匹配不到此工作区文件夹', RangeError);
                }

                const metaJsons = await Promise.all(matchI18nDirList
                    .map((item =>
                        readJsonFile<I18nMetaJson>(item.targetPath)
                            .then((metaJson: I18nMetaJson) => ({ ...metaJson, ...item }))
                    )));
                const i18nContents = metaJsons.flatMap(getI18nList);

                function getI18nList(metaJson: I18nMetaJson & i18nDirItem) {
                    const i18nType = I18nType[mainLanguage];
                    return metaJson
                        .saveContent[i18nType]
                        .flatMap(i18nItem =>
                            Object.entries(i18nItem.content)
                                .map<CompletionItem>((([key, val]) => ({
                                    label: val,
                                    detail: relative(metaJson.originalPath, i18nItem.path),
                                    documentation: i18nItem.path,
                                    insertText: `id: '${key}',defaultMessage: '${val}',`
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
    return languages.registerCompletionItemProvider(SUPPORT_DOCUMENT_SELECTOR, I18nCompetionItemProvider, `{`,);
};