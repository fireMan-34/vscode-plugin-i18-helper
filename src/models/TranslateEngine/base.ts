import { I18nType } from "types/conf";

export type I18nTypeKey = keyof typeof I18nType;

export interface ITransalteOutItem {
  penddingText: string;
  transalteEngineLanguageType: I18nTypeKey;
  transalteText: string;
}

export class TranslateEngine {
  languageMap: Record<I18nTypeKey, string> = {
    ZH_CN: 'zh-CN',
    ZH_HK: 'zh-HK',
    EN_US: 'en-US',
    JA_JP: 'ja-JP',
    KO_KR: 'ko-KR',
    UN_KNOWN: 'UNKNOWN',
  };

  /** 翻译单个文本 */
  async translateOne(penddingText: string, transalteEngineLanguageType: I18nTypeKey): Promise<ITransalteOutItem|null> {
    return {
      penddingText,
      transalteEngineLanguageType: transalteEngineLanguageType,
      transalteText: '翻译后的文本',
    };
  }

  /**　翻译多个文本　默认并发模式 */
  async translate(penddingText: string, transalteEngineLanguageTypes: I18nTypeKey[]): Promise<(ITransalteOutItem|null)[]> {
    return Promise.all(
      transalteEngineLanguageTypes.map((transalteEngineLanguage) => this.translateOne(penddingText, transalteEngineLanguage)),
    );
  }

  createSign(...args: unknown[]) {
    return '';
  }
};