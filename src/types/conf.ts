/** 国际化枚举类型 */
export enum I18nType {
    /** 中文简体 */
    ZH_CN,
    /** 中文繁体 */
    ZH_HK,
    /** 英文 */
    EN_US,
    /** 韩文 */
    KO_KR,
    /** 日文 */
    JA_JP,
    /** 未知 */
    UN_KNOWN,
}

/** 国际化描述对象 */
export interface I18nDescriptionItem {
  lang: I18nType,
  dir: string,
  name: string,
}

/** 国际化映射路径类型 */
export interface I18nMetaJsonSaveContentItem {
  /** 文件路径 */
  path: string,
  /** 国际化映射内容 */
  content: Record<string, string>,
  /** 国际化类型 */
  i18nType: I18nType,
  /** 更新时间 */
  updateTime: string,
}

/** 国际化持久化 json */
export interface I18nMetaJson {
  /** 默认选项 */
  default: {
  },
  /** 保存内容 */
  saveContent: Record<I18nType, I18nMetaJsonSaveContentItem[]>
}

export interface i18nDirItem {
  /** 源路径 */
  originalPath: string;
  /** 插件生成路径 */
  targetPath: string;
  /** 国际化归属路径 激活的国际化项目会提供响应的国际化提示 */
  projectPath: string;
}

/** 项目配置信息 json */
export interface ProjectMetaJson {
  isOpenCheckDir: boolean,
  mainLanguage: keyof typeof I18nType,
  generateTemplate: string,
  /** 运行刷新版本 */
  runTimeVersion: number,
  i18nDirList: i18nDirItem[],
}

// ---------------------------------------------------------------- 国际化配置相关 ⬆