import { existsSync } from "fs";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from 'lodash/isEmpty';
import { join } from "path";
import { ExtensionContext, Uri } from "vscode";

import { DEFAULT_I18N_META } from "constants/i18n";
import {
  I18nFileItem,
  I18nMetaJson,
  I18nMetaJsonSaveContentItem,
  I18nType,
} from "types/index";
import { PromiseAllMap } from "utils/asy";
import { writeI18nConfigJson } from "utils/conf";
import { saveJsonFile } from "utils/fs";
import { generateRuntimeProjectI18nHashPath } from "utils/path";

/** 操作国际化对象的对象 */
export class I18nFileItemUserClass {
  constructor(context: ExtensionContext, scanUri: Uri) {
    this.Context = context;
    this.scanUri = scanUri;

    this.rootPath = generateRuntimeProjectI18nHashPath(context, scanUri);
    this.saveJsonPath = join(this.rootPath, "meta.json");

    const hasMetaJson = existsSync(this.saveJsonPath);
    if (!hasMetaJson) {
      this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
      saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    } else {
      this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
    }
  }

  /** 项目根路径 */
  rootPath: string;
  /** 保存信息路径 */
  saveJsonPath: string;
  /** 根 metaJson */
  i18nMetaJson: I18nMetaJson;
  Context: ExtensionContext;
  /** 扫描路径地址 */
  scanUri: Uri;

  /** 将国际化内容写入路径中 */
  async writeI18nFileContent2Json(set: I18nFileItem[]) {
    const i18nItems = await Promise.all(
      set.map((item) =>
        PromiseAllMap({
          i18nType: item.i18nType,
          content: item.parseKeyAndVals,
          path: Promise.resolve(item.path),
        }).then(
          (val) =>
            ({
              ...val,
              updateTime: new Date().toDateString(),
            } as I18nMetaJsonSaveContentItem)
        )
      )
    );
    i18nItems.forEach((item) =>
      this.i18nMetaJson.saveContent[item.i18nType].push(item)
    );
    for (const key in this.i18nMetaJson.saveContent){
      const i18nTypeKey = key as  I18nType;
      if (isEmpty(this.i18nMetaJson.saveContent[i18nTypeKey])) {
        delete this.i18nMetaJson.saveContent[i18nTypeKey];
      }
    }
    await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    await writeI18nConfigJson(this.Context, this.scanUri, this.saveJsonPath);

    this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
  }
}
