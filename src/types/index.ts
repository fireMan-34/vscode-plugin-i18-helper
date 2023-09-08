import type { ExtensionContext, TextEditor, TextEditorEdit, TextDocument, Position } from 'vscode';

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
  /** 运行刷新版本 */
  runTimeVersion: number,
  i18nDirList: i18nDirItem[],
}

// ---------------------------------------------------------------- 项目配置相关 ⬆

/**
 * 国际化代码解析插件
 */
export interface I18nTextParsePlugin {
  /** 生成模板字符串类型 */
  generateTemplate: string[];
  /** 插件上下文 */
  context: I18nTextParse;
  /** 局部正则 */
  partReg: RegExp,
  /** 整体正则 */
  wholeRule: RegExp,
  /** 判断是否该插件处理 */
  readonly isThisPlugin: boolean;
  /** 匹配值 */
  matchValue: string | null | undefined;
  /** 获取从代码中匹配的 i18n 文本 */
  getMatchI18nText: () => string;
}

export interface I18nTextParseIsPluginThisSupportOptions {
  /** 局部正则 */
  partReg: RegExp,
  /** 整体正则 */
  wholeRule: RegExp,
  /** 扩散行数 0 则不扩散，最小数 0 */
  diffuse?: number,
  /** 成功匹配文本回调 
   * @param {string} text
  */
  matchTextCb: (text: string) => void
}

/** 国际化代码解析对象
 */
export interface I18nTextParse {
  /** 从当前目录获取获取至多上下两行的文本作为识别
   * 从工具库扩展 工具库泛化 此方法实化
   */
  getRangeTextFromProvider(line: number): string;
  /** 获取当前行文本 */
  getLineText(): string;
  /** 格式化处理文本 */
  getFormatText2Parse(str: string): string;
  /**
   * 局部匹配成功后有限次启动范围性扩大匹配，返回最终匹配结果
   * @returns {boolean} 多轮校验是否成功
   */
  isPluginThisSupported(options: I18nTextParseIsPluginThisSupportOptions): boolean;
  /** 文档对象 */
  document: TextDocument;
  /** 当前位置 */
  currentPosition: Position;

  plugins: I18nTextParsePlugin[];

  /** 获取匹配的 i18n 文本 */
  getMatchI18nText(): string | null;
};
// ---------------------------------------------------------------- 国际化代码识别相关相关 ⬆

/** i18n 数据目录 */
export interface I18nDirViewItem {
  /** 国际化目录下的文件路径
   * 最顶层路径由 project Meta 提供
   */
  path: string;
  /** 以 工作区项目目录为基准的 glob 字符串匹配模式
   * @see https://www.npmjs.com/package/glob
   * * 如无则代表是通用匹配，在所有文件上下文都可以消费该国际化数据
   */
  matchUseI18nRegs?: string[];
}

// ---------------------------------------------------------------- 国际化代码目录设置代码语言识别权重相关 ⬆