import { languages, Location, Position, Uri } from 'vscode';
import type { DefinitionProvider, ExtensionContext } from 'vscode';
import { getWrokspaceFloder } from 'utils/path';
import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/index';
import { I18nTextParserClass, createMatchI18nIdPlugin } from 'models/index';
import { getProviderI18nJsonAndMainLanguage } from 'providers/helper';

/**
 * 自定义跳转
 * @see http://blog.haoji.me/vscode-plugin-jump-completion-hover.html
 * 按住 ctrl + click 会触发
 ** 跳转精确位置 - [ ]
 ** 多行匹配 - [x]
 */
const definitionProvider: DefinitionProvider = {
    async provideDefinition(document, position, _token) {
        const i18nTextParser = new I18nTextParserClass(document, position);
        createMatchI18nIdPlugin(i18nTextParser);
        
        const matchValue = i18nTextParser.getMatchI18nText();

        if (matchValue) {
            const currentWorkFolder = await getWrokspaceFloder({
                multiplySelect: 'matchFile',
                matchPath: document.uri,
            });
            const { i18nMainFileContents } = await getProviderI18nJsonAndMainLanguage(currentWorkFolder);

            const i18nContents = i18nMainFileContents.map((item) => ({ ...item, keys: Object.keys(item.content) }));

            const matchI18nContent = i18nContents.find((item) => item.keys.some((key) => key === matchValue));

            if (!matchI18nContent) {
                return;
            }

            return new Location(Uri.file(matchI18nContent.path), new Position(0, 0));

        }
    },
};

export const createDefinitionProvider = (_context: ExtensionContext) => {
    return languages.registerDefinitionProvider(SUPPORT_DOCUMENT_SELECTOR, definitionProvider);
};