import { stringify } from "querystring";
import { Axios, } from 'axios';
import { md5Hash } from "utils/crypto";
import { TranslateEngine, ITransalteOutItem, I18nTypeKey, } from "./base";

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
  appid: string;
  /**　随机数 */
  salt: string;
  /** 签名 */
  sign: string;
}

interface BaiduQueryResponse {
  error_code: number,
  error_msg: string,
  from: string;
  to: string;
  trans_result: [
    { src: string/** 源码 */, dst: string/**翻译 */, },
  ]
}

export class BaiduTranslateEngine extends TranslateEngine {

  appId = '';

  appSecrect = '';

  salt = `${Math.ceil(Math.random() * 1000)}`;

  languageMap: Record<I18nTypeKey, string> = {
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
    const step1 = [this.appId, penddingText, this.salt, this.appSecrect].join('');
    const step2 = md5Hash(step1);
    return step2;
  }

  createQuery(penddingText: string, language: string) {
    const sign = this.createSign(penddingText);
    const query = stringify({
      q: penddingText,
      from: 'auto',
      to: language,
      appid: this.appId,
      salt: this.salt,
      sign,
    } as BaiduQueryIntl as any);
    return {
      q: penddingText,
      from: 'auto',
      to: language,
      appid: this.appId,
      salt: this.salt,
      sign,
    };
  };

  init() {
    this.appId = '20230821001788313';
    this.appSecrect = 'TPZdN8VL15XRjuob3hSx';
  }
  async translate(penddingText: string, transalteEngineLanguageTypes: I18nTypeKey[]): Promise<ITransalteOutItem[]> {
    const [language] = transalteEngineLanguageTypes.map(key => this.languageMap[key]);
    const axios = new Axios({
      method: 'GET',
    });
    const { data, } = await axios.request<BaiduQueryResponse>({
      baseURL: 'http://fanyi-api.baidu.com',
      url: '/api/trans/vip/translate',
      params: this.createQuery(penddingText, language),
      headers: {
      },
    });

    if (data.error_code) {
      throw new Error(data.error_msg);
    }
    const [ trans_result ] = data.trans_result;
    return [{
      penddingText: trans_result.src,
      transalteText: trans_result.dst,
      transalteEngineLanguageType:transalteEngineLanguageTypes[0],     
    }];
  }
}