import type { WorkspaceFolder } from "vscode";

import { isSamePath } from "utils/path";
import type {
  MethodDecoratorFix,
  ProjectGlobalConfig,
  I18nMetaJson,
  I18nMetaJsonSaveContentItem,
} from "types/index";
import { I18nType } from "types/index";
import { readJsonFile } from "utils/fs";
import { emptyReturnError } from "decorators/index";

interface PrepareCheckReturn {
  workspaceFolder: WorkspaceFolder;
  config: ProjectGlobalConfig;
}

/** 检测工作文件目录是否为空 */
const isEmptyWorkspaceFolder: MethodDecoratorFix<() => PrepareCheckReturn> =
  emptyReturnError("匹配不到工作区");

/** 检测当前工作目录是否存在国际化配置文件 */
const isCurrentWorkspaceFolderEmptyJsonFile: MethodDecoratorFix<
  () => Promise<I18nMetaJson["saveContent"][]>
> = emptyReturnError("当前工作目录不存在可消费的国际化数据库");

/** 检测当前工作区主语言是否存在国际化配置文件 */
const isEmtpyMainLanguageAboutI18nFile: MethodDecoratorFix<
  (
    list?: I18nMetaJson["saveContent"][]
  ) => Promise<I18nMetaJsonSaveContentItem[]>
> = emptyReturnError("当前工作区主语言不存在可消费的国际化数据库");

/** i18n json 文件常用操作封装 */
export class I18nDbPaser {
  constructor(
    public globalConfig: ProjectGlobalConfig,
    public workspaceFolder: WorkspaceFolder
  ) {}

  /** 运行前检测必要上下文 */
  @isEmptyWorkspaceFolder
  prepareCheck(): PrepareCheckReturn {
    return {
      config: this.globalConfig,
      workspaceFolder: this.workspaceFolder,
    };
  }

  /** 获取所有和当前工作区相关的 */
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
  @isEmtpyMainLanguageAboutI18nFile
  async getMainLanguageAboutI18nDirList(
    currentI18nDirList?: I18nMetaJson["saveContent"][],
    language?: I18nType
  ) {
    const list = await (currentI18nDirList
      ? Promise.resolve(currentI18nDirList!)
      : this.getCurrentI18nDirList());
    const lang = language ?? I18nType[this.globalConfig.mainLanguage];
    return list.reduce((r, item) => {
      if (item[lang]) {
        r.push(...item[lang]);
      }
      return r;
    }, <I18nMetaJsonSaveContentItem[]>[]);
  }

  /** 将单个文件存储 json 对象解析成扁平数组键值对 */
  getI18nKeyAndValueFromSaveJsonItem(list: I18nMetaJsonSaveContentItem[]) {
    return list.flatMap((item) => Object.entries(item.content));
  }
}
