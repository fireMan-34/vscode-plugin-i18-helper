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

export interface I18nDirItem {
  /** 源路径 */
  originalPath: string;
  /** 插件生成路径 */
  targetPath: string;
  /** 国际化归属路径 激活的国际化项目会提供响应的国际化提示 */
  projectPath: string;
}

/** 国际化解析 目录规则指定对应语种 */
export interface I18nRuleDirItem {
  /** 国际化类型 */
  i18nType: keyof typeof I18nType;
  /** 当前扫描国际化目录 */
  i18nDirPath: string;
  /** 指定路径对应国际化规则路径 */
  rulePath: string;
  /** 对应目录路径 */
  projectPath: string;
}

/** 保存配置信息 json */
export interface ProjectSaveConfig {

  /** 运行刷新版本 */
  runTimeVersion: number,
  /** 国际化目录 */
  i18nDirList: I18nDirItem[],
  /** 关联国际化目录 */
  i18nRuleDirList: I18nRuleDirItem[],
}

/** VS code 配置 */
export interface VScodeConfig {
  /** 是否开始前检测目录是否失效
   * todo 待做功能
   */
  isOpenCheckDir: boolean,
  /** 主要项目使用语言 */
  mainLanguage: keyof typeof I18nType,
  /** 生成的代码模板 */
  generateTemplate: string,
  /** 可扫描的国际化目录路径 */
  scanFolders: string[],
}

/** 全局配置 */
export interface ProjectGlobalConfig extends ProjectSaveConfig, VScodeConfig {

};

// ---------------------------------------------------------------- 国际化配置相关 ⬆