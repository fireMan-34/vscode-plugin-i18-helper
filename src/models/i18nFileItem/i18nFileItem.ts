import type { ExtensionContext } from "vscode";
import { readFile } from "fs/promises";

import { I18nFileItem, I18nType } from "types/index";
import { asyncChain } from "utils/asy";
import { parseKeyAndValTexts2Object } from "utils/code";
import { cacheClassDecoratorFactory, cacheMethDecoratorFactory } from 'decorators/index';

import {
  BaseFile2I18nTypeClass,
  RuleDir2I18nTypeClass,
} from "./i18nFile2Types.plugin";

/** 键值对文本提取正则 */
const KEY_AND_VALUE_REG = /(["'])?[^"']*?\1?:\s*["'].*["'],?/gi;

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
@cacheClassDecoratorFactory
export class I18nFileItemClass implements I18nFileItem {

  /** 识别国际化类型插件 */
  i18nFile2Types: BaseFile2I18nTypeClass[];

  constructor(public path: string, public context: ExtensionContext ) {
    this.i18nFile2Types = [
      new RuleDir2I18nTypeClass(this, context),
      new BaseFile2I18nTypeClass(this, context),
    ];
  }

  get i18nType(): Promise<I18nType> {
    return this.getI18nFile2Types();
  }

  @cacheMethDecoratorFactory()
  private getI18nFile2Types(): Promise<I18nType> {
    return new Promise((resolve, reject) => {
      asyncChain(
        this.i18nFile2Types.map(
          (i18nFile2i18nType) => () => i18nFile2i18nType.isThisTransformer()
        )
      )
        .then((i18nFile2Type) => {
          i18nFile2Type.getI18nType().then(resolve).catch(reject);
        })
        .catch((err) => reject(err));
    });
  }

  get keyAndVals(): Promise<string[]> {
    return this.getKeyAndVals();
  }

  @cacheMethDecoratorFactory()
  private getKeyAndVals(): Promise<string[]> {
    return this.getFileContent().then((content) => {
      const keyAndVals = (
        content.match(KEY_AND_VALUE_REG) || [""]
      ).map((keyAndVal) =>
        keyAndVal === "" || keyAndVal.includes(",")
          ? keyAndVal
          : keyAndVal + ","
      );
      return keyAndVals;
    });
  }

  get parseKeyAndVals(): Promise<Record<string, string>> {
    return this.getParseKeyAndVals();
  }

  @cacheMethDecoratorFactory()
  private getParseKeyAndVals(): Promise<Record<string, string>> {
    return this.keyAndVals.then((keyAndVals) => {
      const lines = keyAndVals.reduce((acc, key) => acc + key, "");
      const object = parseKeyAndValTexts2Object(lines) as Record<
        string,
        string
      >;
      return object;
    });
  };

  @cacheMethDecoratorFactory()
   getFileContent(): Promise<string> {
    return readFile(this.path, { encoding: "utf-8" }).then((content) => {
      return content;
    });
  };
}
