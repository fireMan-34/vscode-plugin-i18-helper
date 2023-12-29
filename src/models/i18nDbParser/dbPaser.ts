import type { WorkspaceFolder } from "vscode";
import isEmpty from "lodash/isEmpty";
import union from "lodash/union";
import mapValues from "lodash/mapValues";

import { isSamePath } from "utils/path";
import type {
  MethodDecoratorFix,
  ProjectGlobalConfig,
  I18nMetaJson,
  I18nMetaJsonSaveContentItem,
} from "types/index";
import { I18nType } from "types/index";
import { readJsonFile } from "utils/fs";
import {
  emptyReturnError,
  conditionReturnError,
  cacheClassDecoratorFactory,
  cacheMethDecoratorFactory,
  cacheAccessorCleanFacory,
} from "decorators/index";

interface PrepareCheckReturn {
  workspaceFolder: WorkspaceFolder;
  config: ProjectGlobalConfig;
}

type I18nUnitArr = readonly [string, string, I18nMetaJsonSaveContentItem];

/** 检测工作文件目录是否为空 */
const isEmptyWorkspaceFolder: MethodDecoratorFix<() => PrepareCheckReturn> =
  emptyReturnError("匹配不到工作区");

/** 检测当前工作目录是否存在国际化配置文件 */
const isCurrentWorkspaceFolderEmptyJsonFile: MethodDecoratorFix<
  () => Promise<I18nMetaJson["saveContent"][]>
> = emptyReturnError("当前工作目录不存在可消费的国际化数据库");

/** 检测当前工作区主语言是否存在国际化配置文件 */
const isEmtpyLangAboutI18nDirListMap: MethodDecoratorFix<
  (
    langs?: I18nType[]
  ) => Promise<Record<I18nType, I18nMetaJsonSaveContentItem[]>>
> = conditionReturnError((r) => {
  const vals = Object.values(r);
  if (isEmpty(vals) || vals.every(isEmpty)) {
    return ["当前工作区主语言不存在可消费的国际化数据库", RangeError];
  }
});

/** i18n json 文件常用操作封装 */
@cacheClassDecoratorFactory
export class I18nDbPaser {
  @cacheAccessorCleanFacory<typeof I18nDbPaser>(["getCurrentI18nDirList"])
  accessor forceUpdate = 0;
  constructor(
    public globalConfig: ProjectGlobalConfig,
    public workspaceFolder: WorkspaceFolder
  ) { }

  /** 运行前检测必要上下文 */
  @isEmptyWorkspaceFolder
  prepareCheck(): PrepareCheckReturn {
    return {
      config: this.globalConfig,
      workspaceFolder: this.workspaceFolder,
    };
  }

  /** 获取所有和当前工作区相关的 */
  @cacheMethDecoratorFactory()
  @isCurrentWorkspaceFolderEmptyJsonFile
  async getCurrentI18nDirList() {
    const { i18nDirList } = this.globalConfig;
    const projectPath = this.workspaceFolder.uri.fsPath;
    const mainLanguageAboutI18nDirList = i18nDirList.filter((dirItem) =>
      isSamePath(dirItem.projectPath, projectPath)
    );
    return Promise.all(
      mainLanguageAboutI18nDirList.map((dirItem) =>
        readJsonFile<I18nMetaJson>(dirItem.targetPath).then(
          (item) => item.saveContent
        )
      )
    );
  }

  /** 获取当前工作区语言所有的国际化键值对文件对象 */
  @isEmtpyLangAboutI18nDirListMap
  async getLangAboutI18nDirListMap(languages?: I18nType[]) {
    const list = await this.getCurrentI18nDirList();
    const langs = this.getLangTypes(languages);
    return list.reduce((r, item) => {
      langs.forEach((lang) => {
        if (!r[lang]) {
          r[lang] = [];
        }
        if (item[lang]) {
          r[lang].push(...item[lang]);
        }
      });
      return r;
    }, {} as Record<I18nType, I18nMetaJsonSaveContentItem[]>);
  }

  /** 将单个文件存储 json 对象解析成扁平数组键值对 */
  getI18nKeyAndValueFromSaveJsonItem(list: I18nMetaJsonSaveContentItem[]): I18nUnitArr[] {
    return list.flatMap((item) => Object.entries(item.content).map(list => [list[0], list[1], item] as const));
  }

  /** 获取多种国际化类型 默认返回主体语言 */
  getLangTypes(langs?: I18nType[]) {
    return langs ?? [I18nType[this.globalConfig.mainLanguage]];
  }
  /** 从已有文件存储字符类型获取所有语言类型 */
  getLangTypesFromDB(list: I18nMetaJson["saveContent"][]) {
    return union(...list.map((item) => (Object.keys(item) as `${I18nType}`[]).filter(k => !isEmpty(item[k]))))
      .filter((item) => item !== `${I18nType.UN_KNOWN}`)
      .map(Number) as I18nType[];
  }

  /** 搜索国际化字符串键值队 */
  async findKeyOrValue(keyOrVal: string, languages?: I18nType[], mode?: 'key' | 'value' | 'all') {
    const searchFn = (function () {
      switch (mode) {
        case 'key':
          return ([k]: I18nUnitArr) => k === keyOrVal;
        case 'value':
          return ([, v]: I18nUnitArr) => v === keyOrVal;
        case 'all':
        default:
          return ([k, v]: I18nUnitArr) => k === keyOrVal || v === keyOrVal;
      }
    })();
    const langs = this.getLangTypes(languages);
    const langMap = await this.getLangAboutI18nDirListMap(langs);
    const langKVMap = mapValues(langMap, (list) =>
      this.getI18nKeyAndValueFromSaveJsonItem(list).find(searchFn)
    );
    return langKVMap;
  }
}
