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

  async translate(penddingText: string, transalteEngineLanguageTypes: I18nTypeKey[]): Promise<ITransalteOutItem[]> {
    return [
      {
        penddingText,
        transalteEngineLanguageType: transalteEngineLanguageTypes[0],
        transalteText: '翻译后的文本',
      }
    ];
  }

  createSign(...args: unknown[]) {
    return '';
  }
};