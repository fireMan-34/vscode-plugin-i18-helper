import { readFile } from "fs/promises";

import { I18nFileItem, I18nType } from "types/index";
import { asyncChain } from "utils/asy";
import { parseKeyAndValTexts2Object } from "utils/code";

import {
  BaseFile2I18nTypeClass,
  RuleDir2I18nTypeClass,
} from "./i18nFile2Types.plugin";

/** 键值对文本提取正则 */
const KEY_AND_VALUE_REG = /(["'])?[^"']*?\1?:\s*["'].*["'],?/gi;

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
export class I18nFileItemClass implements I18nFileItem {

  /** 识别国际化类型插件 */
  i18nFile2Types: BaseFile2I18nTypeClass[];

  cacheMap: Partial<I18nFileItem>;

  path: string;

  constructor(path: string) {
    this.cacheMap = {};
    this.path = path;
    this.i18nFile2Types = [
      new RuleDir2I18nTypeClass(this),
      new BaseFile2I18nTypeClass(this),
    ];
  }

  get i18nType(): Promise<I18nType> {
    if (this.cacheMap.i18nType) {
      return this.cacheMap.i18nType;
    }

    return new Promise((resolve, reject) => {
      asyncChain(
        this.i18nFile2Types.map(
          (i18nFile2i18nType) => () => i18nFile2i18nType.isThisTransformer()
        )
      )
        .then((i18nFile2Type) => {
          i18nFile2Type.getI18nType().then(resolve);
        })
        .catch((err) => reject(err));
    });
  }

  get keyAndVals(): Promise<string[]> {
    if (this.cacheMap.keyAndVals) {
      return this.cacheMap.keyAndVals;
    } else {
      return this.getFileContent().then((content) => {
        const keyAndVals = (
          content.match(KEY_AND_VALUE_REG) || [""]
        ).map((keyAndVal) =>
          keyAndVal === "" || keyAndVal.includes(",")
            ? keyAndVal
            : keyAndVal + ","
        );
        this.cacheMap.keyAndVals = Promise.resolve(keyAndVals);
        return keyAndVals;
      });
    }
  }

  get parseKeyAndVals(): Promise<Record<string, string>> {
    if (this.cacheMap.parseKeyAndVals) {
      return this.cacheMap.parseKeyAndVals;
    } else {
      return this.keyAndVals.then((keyAndVals) => {
        const lines = keyAndVals.reduce((acc, key) => acc + key, "");
        const object = parseKeyAndValTexts2Object(lines) as Record<
          string,
          string
        >;
        this.cacheMap.parseKeyAndVals = Promise.resolve(object);
        return object;
      }).catch(err => {
        return {};
      });
    }
  }

  getFileContent: () => Promise<string> = () => {
    if (this.cacheMap.getFileContent) {
      return this.cacheMap.getFileContent();
    } else {
      return readFile(this.path, { encoding: "utf-8" }).then((content) => {
        this.cacheMap.getFileContent = () => Promise.resolve(content);
        return content;
      });
    }
  };
}
