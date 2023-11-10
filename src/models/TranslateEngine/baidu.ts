import { stringify } from "querystring";
import { Axios, } from 'axios';
import { md5Hash } from "utils/crypto";
import { requestX } from "utils/request";
import { TranslateEngine, ITransalteOutItem, I18nTypeKey, } from "./base";
import { writeFile } from "fs/promises";
import { join } from "path";

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

export class BaiduTranslateEngine extends TranslateEngine {

  appId = '';

  appSecrect = '';

  salt = `${Math.ceil( Math.random() * 1000)}`;

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
    const step1 = `${this.appId}${penddingText}${this.salt}${this.appSecrect}`;
    const step2 = md5Hash(step1);
    return step2;
  }

  createQuery(penddingText: string, language: string) {
    const sign = this.createSign(penddingText);
    const query = stringify({
      q: penddingText,
      from: 'auto',
      to: language,
      appId: this.appId,
      salt: this.salt,
      sign,
    } as BaiduQueryIntl as any);
    // return query;
    return {
      q: penddingText,
      from: 'auto',
      to: language,
      appId: this.appId,
      salt: this.salt,
      sign,
    } 
  };

  init() {
    this.appId = '20230821001788313';
    this.appSecrect = 'TPZdN8VL15XRjuob3hSx';
  }
  async translate(penddingText: string, transalteEngineLanguageTypes: I18nTypeKey[]): Promise<ITransalteOutItem[]> {
    const [ language ] = transalteEngineLanguageTypes.map(key => this.languageMap[key]);
    const axios = new Axios({
      method: 'GET',
    });
    const { data, } = await axios.request({
      baseURL: 'http://fanyi-api.baidu.com',
      url: '/api/trans/vip/translate',
      params: this.createQuery(penddingText, language),
      headers: {
      },
    });

    if (data.error_code) {
      throw new Error(data.error_msg);
    }

    return [];
  }
}