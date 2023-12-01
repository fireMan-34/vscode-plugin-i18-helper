import axios from "axios";
import { randomUUID } from 'crypto';

import { sha256Hash } from "utils/crypto";

import type { I18nTypeKey, ITransalteOutItem } from "./base";
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
  /** uuid */
  salt: string;
  /** 签名 */
  sign: string;
  /** 签名类型 */
  signType: "v3";
  /** 时间类型 */
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

export class WangYiTranslateEngine extends TranslateEngine {
  appId: string = "";
  appSecret: string = "";
  url: string = "https://openapi.youdao.com/api";

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
    const from = this.languageMap.ZH_CN;
    const to = this.languageMap[transalteEngineLanguageType];
    const query = this.createQuery(penddingText, from, to);
    axios
      .post(this.url, query, {})
      .then((res) => {
        console.log("执行成功", res);
      })
      .catch((err) => {
        console.log("错误", err);
      });

    return null;
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
    const salt = randomUUID();
    const curtime = Date.now().toString();
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
