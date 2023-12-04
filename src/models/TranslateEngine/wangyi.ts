import axios from "axios";
import { stringify } from "querystring";

import { sha256Hash } from "utils/crypto";

import type { ITransalteOutItem } from "./base";
import { TranslateEngine } from "./base";

/** @link https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html */
export interface WangYiQueryIntl {
  /** 待翻译文本 */
  q: string;
  /** 源语言 */
  from: "auto" | string;
  /** 目标语言 */
  to: string;
  /** app id */
  appKey: string;
  /** uuid 这里有点奇怪简易参考 demo 写 */
  salt: string;
  /** 签名 */
  sign: string;
  /** 签名类型 */
  signType: "v3";
  /** 时间戳秒 这里有点奇怪简易参考 demo 写 */
  curtime: string;
  /** 翻译结果音频格式，仅支持 MP3 */
  ext?: "mp3";
  /** 音频返回 0 女声 1 男声 */
  voice?: "0" | "1";
  /** 	是否严格按照指定from和to进行翻译：true/false 如果为false，则会自动中译英，英译中。默认为false */
  strict?: boolean;
  /** 用户上传的词典 用户指定的词典 out_id，支持英中互译，更多语种方向请前往控制台查询 */
  vocabId?: string;
  /** 领域化翻译 默认为：general。仅在控制台开通领域化翻译的情况下可传，支持领域见下表 */
  domain?: string;
  /**　拒绝领域化翻译降级-当领域化翻译失败时改为通用翻译　true或false，默认为：false。仅在控制台开通领域化翻译的情况生效。 */
  rejectFallback?: "true" | "false";
}

export interface WangYiQueryResponse {
  /** 错误码 */
  errorCode: string;
  /** 原语言 查询正确时一定存在 */
  query?: string;
  /** 翻译语言 查询正确时一定存在 */
  translation?: string[];
  /** 词义 基本词典，查词时才有 */
  basic?: string;
  /** 网络释义 该结果不一定存在 */
  web?: string;
  /** 原语言到目标语言 */
  l: `${string}-${string}`;
  /** 词典deeplink 查询语种为支持语言时，存在 */
  dict?: string;
  /** webdeeplink	查询语种为支持语言时，存在 */
  webdict?: string;
  /** 翻译结果发音地址	翻译成功一定存在，需要应用绑定语音合成服务才能正常播放
否则返回110错误码 */
  tSpeakUrl?: string;
  /** 源语言发音地址	翻译成功一定存在，需要应用绑定语音合成服务才能正常播放
否则返回110错误码 */
  speakUrl?: string;
  /** 单词校验后的结果	主要校验字母大小写、单词前含符号、中文简繁体 */
  returnPhrase: [];
}

const postApi = (params: WangYiQueryIntl) => {
  return axios.request<WangYiQueryResponse>({
    url: "https://openapi.youdao.com/api",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    paramsSerializer = (params) => stringify(params),
    params,
  });
};
/** 翻译错误码理由 */
const errorCodeReason = (res: WangYiQueryResponse) => {
  if (res.errorCode) {
    throw new Error(
      `网易请求错误码: ${res.errorCode}, 请查询 https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html`
    );
  }
};

export class WangYiTranslateEngine extends TranslateEngine {
  appId: string = "";
  appSecret: string = "";

  devInit() {
    this.appId = "4f0331ee24a30e51";
    this.appSecret = "3yrOsQ0CERnktsXRv5eYkP7tpUeMePOw";
  }

  languageMap: Record<
    "ZH_CN" | "ZH_HK" | "EN_US" | "KO_KR" | "JA_JP" | "UN_KNOWN",
    string
  > = {
    ZH_CN: "zh-CHS",
    ZH_HK: "zh-CHT",
    EN_US: "en",
    KO_KR: "ko",
    JA_JP: "ja",
    UN_KNOWN: "auto",
  };

  async translateOne(
    penddingText: string,
    transalteEngineLanguageType:
      | "ZH_CN"
      | "ZH_HK"
      | "EN_US"
      | "KO_KR"
      | "JA_JP"
      | "UN_KNOWN"
  ): Promise<ITransalteOutItem | null> {
    try {
      const from = this.languageMap.ZH_CN;
      const to = this.languageMap[transalteEngineLanguageType];
      const query = this.createQuery(penddingText, from, to);
      const {
        data,
        data: { translation },
      } = await postApi(query);
      errorCodeReason(data);
      const [transalteText] = translation ?? [];
      if (!transalteText) {
        return null;
      }
      return {
        penddingText,
        transalteEngineLanguageType,
        transalteText,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  createSign(
    /**应用 id */
    appId: string,
    /**
     * * input的计算方式为：
     * input=q前10个字符 + q长度 + q后10个字符（当q长度大于20）或
     * input=q字符串（当q长度小于等于20）
     * */
    input: string,
    salt: string,
    curtime: string,
    appSecrect: string
  ): string {
    return sha256Hash(`${appId}${input}${salt}${curtime}${appSecrect}`);
  }

  createQuery(query: string, from: string, to: string): WangYiQueryIntl {
    const salt = new Date().getTime().toString();
    const curtime = Math.round(new Date().getTime() / 1000).toString();
    return {
      appKey: this.appId,
      q: query,
      signType: "v3",
      salt,
      sign: this.createSign(
        this.appId,
        this.getInput(query),
        salt,
        curtime,
        this.appSecret
      ),
      curtime,
      from,
      to,
    };
  }

  getInput(query: string): string {
    return query.length > 20
      ? `${query.slice(0, 10)}${query.length}${query.slice(-10)}`
      : query;
  }
}
