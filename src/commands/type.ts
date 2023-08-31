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

export interface I18nDescriptionItem {
  lang: I18nType,
  dir: string,
  name: string,
}

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

export interface I18nMetaJson {
  /** 默认选项 */
  default: {
    lange: I18nType,
  },
  /** 保存内容 */
  saveContent: Record<I18nType, I18nMetaJsonSaveContentItem[]>
}