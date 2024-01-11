import type { DefinitionProvider, ExtensionContext } from 'vscode';
import { Location, Uri, languages, workspace, } from 'vscode';

import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/index';
import { I18nDbPaser, I18nGenTemplate } from 'models/index';
import { getGlobalConfigurationSync } from 'utils/conf';
import { getWrokspaceFloder } from 'utils/path.code';

/** 定义跳转 2.0 版本 */
const definitionProvider: DefinitionProvider = {
    async provideDefinition(document, position, token) {
        const i18nGenTemplatee = new I18nGenTemplate().refreshTemplateModals();
        const i18nId = i18nGenTemplatee.getI18nIdFromDocumentPosition(document, position);
        if (!i18nId) {
            return;
        }
        const globalConfig = getGlobalConfigurationSync();
        const workspaceFolder = await getWrokspaceFloder({
            multiplySelect: 'matchFile',
            matchPath: document.uri,
        });
        if (!workspaceFolder) {
            return;
        }
        const i18nDbParser = new I18nDbPaser(globalConfig, workspaceFolder);
        i18nDbParser.prepareCheck();
        const pathMaps = await i18nDbParser.findKeyOrValue(i18nId, void 0, 'key');
        const { mainLanguage, } = globalConfig;
        const mainI18nData = pathMaps[mainLanguage];
        if (!mainI18nData) {
            return;
        }
        const [key, value, item] = mainI18nData;
        const dbDocument = await workspace.openTextDocument(item.path);
        const dbContent = dbDocument.getText();
        const pos = dbDocument.positionAt(dbContent.search(new RegExp(`("|')?${key}\\1?`)));
        return new Location(Uri.file(item.path), pos);
    },
};

export const createAstDefinitionProvider = (context: ExtensionContext) => languages.registerDefinitionProvider(SUPPORT_DOCUMENT_SELECTOR, definitionProvider);