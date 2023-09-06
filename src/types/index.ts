import type { ExtensionContext, TextEditor, TextEditorEdit } from 'vscode';

export interface XTextEditor extends TextEditor {
  authority: string;
  fragment: string;
  /** 当前文件路径, get 访问 */
  fsPath: string;
  /** 访问路径 */
  path: string;
  query: string;
  scheme: 'file' | string;
}

/** 指令内容 */
export interface ICommondItem {
  /** 指令文本 */
  cmd: string;
  /** 指令执行内容
   * @see /node_modules/@types/vscode/index.d.ts#L9593
   */
  cmdExcuter: (context: ExtensionContext, textEditor: XTextEditor, edit: TextEditorEdit, ...args: any[]) => void;
  /** 激活后回调执行
   * 存在一定的问题
   * ? 比方说不调用命令就不执行
   */
  excuter?: (context: ExtensionContext) => void;
}

// ---------------------------------------------------------------- 命令相关 ⬆

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

/** 国际化描述美剧对象 */
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

/** 国际化文件管理原子对象 */
export interface I18FileItem {
  /** 文件路径 */
  path: string;
  /** 国际化类型 */
  i18nType: Promise<I18nType>,
  /** 国际化键值对 */
  keyAndVals: Promise<string[]>;
  /** 国际化解析 map 对象 */
  parseKeyAndVals: Promise<Record<string, string>>;
  /** 获取文件 utf-8 解析内容 */
  getFileContent: () => Promise<string>;
}

// ---------------------------------------------------------------- 国际化相关 ⬆

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
  i18nDirList: i18nDirItem[],
}

// ---------------------------------------------------------------- 项目配置相关 ⬆