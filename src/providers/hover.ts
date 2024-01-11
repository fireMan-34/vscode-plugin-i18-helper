import { ExtensionContext, HoverProvider, Uri } from 'vscode';
import { Hover, languages } from 'vscode';
import { SUPPORT_DOCUMENT_SELECTOR, I18N_DESCRIPTION_MAP } from 'constants/index';
import { getWrokspaceFloder } from 'utils/path.code';
import { I18nTextParserClass, createMatchI18nIdPlugin } from 'models/index';
import { I18nMetaJsonSaveContentItem, I18nType, } from 'types/index';
import { getProviderI18nJsonAndMainLanguage } from 'providers/helper';

/**
 * 国际化高亮
 */
const hoverProvider: HoverProvider = {
  async provideHover(document, position, token) {
    
    const i18nTextParser = new I18nTextParserClass(document, position);
    createMatchI18nIdPlugin(i18nTextParser);
    
    const matchValue = i18nTextParser.getMatchI18nText();

    if (matchValue) {
      const currentWorkFolder = await getWrokspaceFloder({
        multiplySelect: 'matchFile',
        matchPath: document.uri,
      });
      const { mainLanguage, i18nDirJsons } = await getProviderI18nJsonAndMainLanguage(currentWorkFolder);
      const i18nTypeKeys = Object.values(I18nType);
      const filterI18nFileContents = i18nDirJsons.flatMap((dirJson =>
        i18nTypeKeys
          .flatMap(i18n => (dirJson.saveContent[i18n as I18nType] || []))
          .filter((i18nFileContent => i18nFileContent.content[matchValue]))
      ));
      const generateTextFromI18nFileContent = (item: I18nMetaJsonSaveContentItem) => {
        const value = item.content[matchValue]!;
        const i18nDescription = I18N_DESCRIPTION_MAP[item.i18nType];
        const path = Uri.file(item.path).toString();
        const strs = [
          `- ${i18nDescription.name}:`,
          `   - 翻译: ${value}`,
          `   - 文件: [${item.path}](${path}) `,
        ];
        return strs;
      };

      const mainLanguageText = `主体语言: ${I18N_DESCRIPTION_MAP[mainLanguage].name}`;

      return new Hover([mainLanguageText, ...filterI18nFileContents.flatMap(generateTextFromI18nFileContent)].join('\n\n'));
    }
  },
};

/**
 * @deprecated 旧工作模式，依照渐进式文本正则解析工作，自定义规则、动态模板生成规则等
 * @param context 
 * @returns 
 */
export const createHoverProvider = (context: ExtensionContext) => {
  return languages.registerHoverProvider(SUPPORT_DOCUMENT_SELECTOR, hoverProvider);
};