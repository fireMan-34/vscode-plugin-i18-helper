import { ExtensionContext, Uri } from "vscode";
import { DEFAULT_I18N_META } from "constants/i18n";
import { existsSync } from "fs";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import countBy from "lodash/countBy";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import union from "lodash/union";
import intersection from "lodash/intersection";
import { PromiseAllMap, asyncChain } from "utils/asy";
import { getCharsI18nType, parseKeyAndValTexts2Object } from "utils/code";
import {
  writeI18nConfigJson,
  getSaveJsonConfig,
  getGlobalConfiguration,
  refreshI18nConfigJson,
} from "utils/conf";
import { saveJsonFile } from "utils/fs";
import {
  generateRuntimeProjectI18nHashPath,
  getPathSameVal,
  isSubPath,
} from "utils/path";
import {
  I18nFileItem,
  I18nMetaJsonSaveContentItem,
  I18nMetaJson,
  I18nType,
  I18nRuleDirItem,
} from "types/index";

/** 默认 文件 utf-8 字符范围频率 判断国际化类型 */
class BaseFile2I18nTypeClass {
  file: I18nFileItemClass;

  constructor(file: I18nFileItemClass) {
    this.file = file;
  }

  isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
    return Promise.resolve(this);
  }

  getI18nType(): Promise<I18nType> {
    const file = this.file;

    return file.parseKeyAndVals.then((record) => {
      const list = Object.values(record);
      const i18nTypes = list.map(getCharsI18nType);
      const countMap = countBy(i18nTypes);
      const i18nType = +Object.entries(countMap).reduce(
        (maxKeyAndVal, curKeyAndVal) =>
          curKeyAndVal[1] > maxKeyAndVal[1] ? curKeyAndVal : maxKeyAndVal,
        [`${I18nType.UN_KNOWN}`, 0]
      )[0] as I18nType;
      return i18nType;
    });
  }
}

class RuleDir2I18nTypeClass extends BaseFile2I18nTypeClass {
  suitI18nRuleDirList: I18nRuleDirItem[] = [];

  constructor(file: I18nFileItemClass) {
    super(file);
  }

  async isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
    const file = this.file;
    const { i18nRuleDirList } = await getSaveJsonConfig(
      I18nFileItemClass.Context
    );
    this.suitI18nRuleDirList = i18nRuleDirList.filter((dirItem) =>
      isSubPath(dirItem.rulePath, file.path)
    );
    if (isEmpty(this.suitI18nRuleDirList)) {
      return Promise.reject();
    }
    return this;
  }

  async getI18nType(): Promise<I18nType> {
    const i18nDirRuleItem = this.suitI18nRuleDirList
      .map((item) => ({
        item,
        point: getPathSameVal(item.rulePath, this.file.path),
      }))
      .reduce((acc, cur) => {
        if (!acc) {
          return cur;
        }
        return acc.point >= cur.point ? acc : cur;
      }).item;
    return I18nType[i18nDirRuleItem.i18nType];
  }
}

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
export class I18nFileItemClass implements I18nFileItem {
  /** 键值对文本提取正则 */
  static KEY_AND_VALUE_REG = /(["'])?[^"']*?\1?:\s*["'].*["'],?/gi;

  static Context: ExtensionContext;

  static initContext(context: ExtensionContext): void {
    this.Context = context;
  }

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
          content.match(I18nFileItemClass.KEY_AND_VALUE_REG) || [""]
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
    await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    await writeI18nConfigJson(this.Context, this.scanUri, this.saveJsonPath);

    this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
  }
}

export const rescanI18nFileContentJson = async (context: ExtensionContext) => {
  const globalConfig = await getGlobalConfiguration();
  const { isOpenCheckDir, i18nDirList, i18nRuleDirList } =
    cloneDeep(globalConfig);

  let nextDirList = i18nDirList,
    nextI18nRuleDirList = i18nRuleDirList;
  let isWrite = false;

  if (isOpenCheckDir) {
    const pathCheckNoExists = union(
      i18nDirList.flatMap((item) => [
        item.originalPath,
        item.targetPath,
        item.projectPath,
      ]),
      i18nRuleDirList.flatMap((item) => [
        item.i18nDirPath,
        item.projectPath,
        item.rulePath,
      ])
    )
      .map((path) => ({ path, isExist: existsSync(path) }))
      .filter((item) => !item.isExist)
      .map((item) => item.path);
    // 存在可移除文件
    if (pathCheckNoExists.length > 0) {
      isWrite = true;

      const requireRemoveDirList = i18nDirList.filter((item) =>
        intersection(
          [item.originalPath, item.targetPath, item.projectPath],
          pathCheckNoExists
        )
      );
      // 移除无效目录文件
      nextDirList = i18nDirList.filter(
        (item) =>
          !intersection(
            [item.originalPath, item.targetPath, item.projectPath],
            pathCheckNoExists
          )
      );
      nextI18nRuleDirList = i18nRuleDirList.filter(
        (item) =>
          !requireRemoveDirList.find(
            (removeDirItem) =>
              removeDirItem.projectPath === item.projectPath ||
              removeDirItem.originalPath === item.i18nDirPath
          )
      );
      // 删除运行时临时配置
      await Promise.allSettled(
        requireRemoveDirList.map((removeDirItem) =>
          unlink(removeDirItem.targetPath)
        )
      );
    }

    if (isWrite) {
      await refreshI18nConfigJson(context, {
        projectConf: {
          ...globalConfig,
          i18nDirList: nextDirList,
          i18nRuleDirList: nextI18nRuleDirList,
        },
        isSave: true,
        refreshType: "set",
      });
    }
  }
};
