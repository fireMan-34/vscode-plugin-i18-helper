import type { CompletionItemProvider, ExtensionContext } from 'vscode';
import { languages, window, CompletionItem, CompletionItemKind } from 'vscode';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import isEmpty from 'lodash/isEmpty';
import { GlobalExtensionSubject } from 'utils/conf';
import { getWrokspaceFloder, isSamePath } from 'utils/path';
import { FORMAT_MESSAGE_ID_REGEX } from 'utils/code';
import { thorwNewError } from 'utils/log';
import { readJsonFile } from 'utils/fs';
import { I18nMetaJson } from 'types/index';



/** @see http://blog.haoji.me/vscode-plugin-jump-completion-hover.html
 * * 步骤分解
 * 1. 匹配符合文本信息 -[x]
 * 2. 判断是否符合全局信息管理空间 -[x]
 * 3. 扫描对应文件 -[ ]
 * 4. 生成对应运行时激活对象 -[]
 * 5. 输出提示 -[]
 * 6. 
 */
const I18nCompetionItemProvider: CompletionItemProvider = {
    async provideCompletionItems(document, position, token, context) {
        try {
        const line = document.lineAt(position);
        const lineText = line.text;
        window.showInformationMessage(document.getText());
        if (FORMAT_MESSAGE_ID_REGEX.test(lineText)) {
            const { i18nDirList } = await lastValueFrom(GlobalExtensionSubject);
            console.log(i18nDirList); // 执行不到这里
            const documnetUrl = document.uri.fsPath;
            const currentWorkspaceFolder = await getWrokspaceFloder({
                multiplySelect: 'matchI18n',
                matchI18nPath: documnetUrl,
            });
            const matchI18nDirList = i18nDirList.filter(i18nDir => isSamePath(i18nDir.projectPath, currentWorkspaceFolder.uri.fsPath));

            if (isEmpty(matchI18nDirList)) {
                thorwNewError('全局配置匹配不到此工作区文件夹', RangeError);
            }

            const metaJsons = await Promise.all(matchI18nDirList.map((item => readJsonFile<I18nMetaJson>(item.targetPath))));
            const i18nContents = metaJsons.flatMap(getI18nList).map(item => new CompletionItem(item, CompletionItemKind.Value));

            function getI18nList(metaJson: I18nMetaJson) {
                const i18nType = metaJson.default.lange;
                return metaJson.saveContent[i18nType].flatMap(i18nItem => Object.values(i18nItem.content));
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
const createI18nCompetionItemProvider = (context: ExtensionContext) => {
    context.subscriptions.push(languages.registerCompletionItemProvider([
        { language: 'typescript', scheme: 'file', },
        { language: 'javascript', scheme: 'file', },
    ], I18nCompetionItemProvider, `'`, `"`));
};

export default createI18nCompetionItemProvider;
