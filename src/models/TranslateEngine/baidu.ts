import { Axios } from "axios";

import { conditionReturnError, emptyReturnError, } from 'decorators/index';
import type { MethodDecoratorFix } from "types/index";
import { I18nType, } from 'types/index';
import { md5Hash } from "utils/crypto";

import { ITransalteOutItem, TranslateEngine } from "./base";

interface BaiduQueryIntl {
  /**
   * @description 请求翻译query
   * @tip UTF-8编码
   */
  q: string;
  /**
   * @description 翻译源语言
   */
  from: "auto" | string;
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
  error_code: number;
  error_msg: string;
  from: string;
  to: string;
  trans_result: [{ src: string /** 源码 */; dst: string /**翻译 */ }];
}

/** 异常码报错 */
const errrorResonFromCode: MethodDecoratorFix<
  (params: BaiduQueryIntl) => Promise<BaiduQueryResponse>
> = conditionReturnError((res) => {
  if (res.error_code) {
    return [ res.error_msg, Error ];
  }
});
/** 翻译为空 */
const emptyResult: MethodDecoratorFix<
  (params: BaiduQueryIntl) => Promise<BaiduQueryResponse>
> = emptyReturnError('翻译为空');

export class BaiduTranslateEngine extends TranslateEngine {
  appId = "";

  appSecrect = "";

  salt = `${Math.ceil(Math.random() * 1000)}`;

  languageMap: Record<I18nType, string> = {
    ZH_CN: "zh",
    ZH_HK: "cht",
    KO_KR: "kor",
    EN_US: "en",
    JA_JP: "jp",
    UN_KNOWN: "auto",
  };

  createSign(penddingText: string): string {
    const step1 = [this.appId, penddingText, this.salt, this.appSecrect].join(
      ""
    );
    const step2 = md5Hash(step1);
    return step2;
  }

  createQuery(penddingText: string, language: string) {
    const sign = this.createSign(penddingText);
    return {
      q: penddingText,
      from: "auto",
      to: language,
      appid: this.appId,
      salt: this.salt,
      sign,
    };
  }

  init() {
    this.appId = "20230821001788313";
    this.appSecrect = "TPZdN8VL15XRjuob3hSx";
  }

  @errrorResonFromCode
  @emptyResult
  postApi(params: BaiduQueryIntl) {
    const axios = new Axios({
      method: "GET",
      // 有点奇怪不生效
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return axios
      .request({
        baseURL: "http://fanyi-api.baidu.com",
        url: "/api/trans/vip/translate",
        params,
      })
      .then((res) => JSON.parse(res.data) as BaiduQueryResponse);
  }

  async translateOne(
    penddingText: string,
    transalteEngineLanguageType: I18nType
  ): Promise<ITransalteOutItem | null> {
    const language = this.languageMap[transalteEngineLanguageType];
    const query = this.createQuery(penddingText, language);
    const data = await this.postApi(query);
    const [trans_result] = data.trans_result;

    return {
      penddingText: trans_result.src,
      transalteText: trans_result.dst,
      transalteEngineLanguageType: transalteEngineLanguageType,
    };
  }
}
