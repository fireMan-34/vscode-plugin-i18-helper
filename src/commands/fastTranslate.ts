import vscode from "vscode";
import { stringify } from 'querystring';
import type { ICommondItem } from 'types/index';
import { CMD_KEY, } from 'constants/index';
import { I18nType } from 'types/index';
import { getGlobalConfiguration } from 'utils/conf';
import { md5Hash, } from 'utils/crypto';
import { requestX } from "utils/request";

type I18nTypeKey = keyof typeof I18nType;

/** crypto 模块大类笔记
 * 
 * Certificate 证明书
 * 
 * Cipher 加密 密文
 */

interface ITransalteOutItem {
  penddingText: string;
  transalteEngineLanguageType: I18nTypeKey;
  transalteText: string;
}

class TranslateEngine {
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

interface BaiduQueryIntl {
  /**
   * @description 请求翻译query
   * @tip UTF-8编码
   */
  q: string;
  /** 
   * @description 翻译源语言
   */
  from: 'auto' | string;
  /** 
   * @description 目标语言
   */
  to: string;
  /**　
   * @description APPID
   */
  appId: string;
  /**　随机数 */
  salt: string;
  /** 签名 */
  sign: string;
}

class BaiduTranslateEngine extends TranslateEngine {
  baseApi = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

  appId = '';

  appSecrect = '';

  salt = `${Math.ceil( Math.random() * 1000)}`;

  languageMap: Record<"ZH_CN" | "ZH_HK" | "EN_US" | "KO_KR" | "JA_JP" | "UN_KNOWN", string> = {
    ZH_CN: 'zh',
    ZH_HK: 'cht',
    KO_KR: 'kor',
    EN_US: 'en',
    JA_JP: 'jp',
    UN_KNOWN: 'auto',
  };

  createSign(
    penddingText: string,


  ): string {
    const step1 = `${this.appId}${penddingText}${this.salt}${this.appSecrect}`;
    const step2 = md5Hash(step1);
    return step2;
  }

  createQuery(penddingText: string, ) {
    const sign = this.createSign(penddingText);
    const query = stringify({
      q: penddingText,
      from: 'auto',
      to: '',
      appId: this.appId,
      salt: this.salt,
      sign,
    } as BaiduQueryIntl as any);
    return query;
  };

  init() {
    this.appId = '20230821001788313';
    this.appSecrect = 'TPZdN8VL15XRjuob3hSx';
  }
  async translate(penddingText: string, transalteEngineLanguageTypes: ("ZH_CN" | "ZH_HK" | "EN_US" | "KO_KR" | "JA_JP" | "UN_KNOWN")[]): Promise<ITransalteOutItem[]> {
    const [ language ] = transalteEngineLanguageTypes.map(key => this.languageMap[key]);
    const [ clientReq, clientReqPromise ] = requestX({ 
      path: this.baseApi + '?' + this.createQuery(penddingText),
     });
     clientReqPromise.then(console.log);
    return [];
  }
}

const transalteEngineMap = new Map<string, TranslateEngine>();

/** 快速翻译单个文本 */
const fastTranslate = async (context: vscode.ExtensionContext, ...args: any[]) => {
  console.log('翻译输入参数', args);

  /** 待翻译文本 */
  const penddingText = '';

  const {
    fastTranslateLanguageType,
    translateEngine,
  } =  await getGlobalConfiguration();

  const transalteEngine = transalteEngineMap.get(translateEngine);

  if (!transalteEngine) {
    return;
  }

  const result = await transalteEngine.translate(penddingText, fastTranslateLanguageType);

  // mock 不下去了，后面这一段需要设计用户如何使用，
  
  return result;
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: CMD_KEY.FAST_TRANSLATE,
  cmdExcuter: fastTranslate,
};
export default item;