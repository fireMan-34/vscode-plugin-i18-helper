import type { ExtensionContext, HoverProvider } from 'vscode';
import { Hover, languages } from 'vscode';
import { SUPPORT_DOCUMENT_SELECTOR, I18N_DESCRIPTION_MAP } from 'constants/index';
import { getWrokspaceFloder } from 'utils/path';
import { I18nTextParserClass } from 'models/index';
import { I18nMetaJsonSaveContentItem, I18nType, } from 'types/index';
import { getProviderI18nJsonAndMainLanguage } from 'providers/helper';

/**
 * 国际化高亮
 */
const hoverProvider: HoverProvider = {
  async provideHover(document, position, token) {
    const i18nTExtParser = new I18nTextParserClass(document, position);
    const matchValue = i18nTExtParser.getMatchI18nKey();
    
    if (matchValue) {
      const currentWorkFolder = await getWrokspaceFloder({
        multiplySelect: 'matchFile',
        matchPath: document.uri,
      });
      const { mainLanguage, i18nDirJsons } = await getProviderI18nJsonAndMainLanguage(currentWorkFolder);
      const i18nType = I18nType[mainLanguage];
      const i18nTypeKeys = Object.values(I18nType);
      const filterI18nFileContents = i18nDirJsons.flatMap((dirJson =>
        i18nTypeKeys
          .flatMap(i18n => (dirJson.saveContent[i18n as I18nType] || []))
          .filter((i18nFileContent => i18nFileContent.content[matchValue]))
      ));
      const generateTextFromI18nFileContent = (item: I18nMetaJsonSaveContentItem) => {
        const value = item.content[matchValue]!;
        const i18nDescription = I18N_DESCRIPTION_MAP[item.i18nType];
        const path = item.path;
        const strs = [
          `- ${i18nDescription.name}:`,
          `   - 翻译: ${value}`,
          `   - 文件: ${path} `,
        ];
        return strs;
      };

      const mainLanguageText = `主体语言: ${I18N_DESCRIPTION_MAP[i18nType].name}`;

      return new Hover([mainLanguageText, ...filterI18nFileContents.flatMap(generateTextFromI18nFileContent)].join('\n\n'));
    }
  },
};

export const createHoverProvider = (context: ExtensionContext) => {
  return languages.registerHoverProvider(SUPPORT_DOCUMENT_SELECTOR, hoverProvider);
};