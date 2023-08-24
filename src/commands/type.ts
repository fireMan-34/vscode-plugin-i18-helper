import type { ExtensionContext  } from 'vscode';

/** 指令内容 */
export interface ICommondItem {
  /** 指令文本 */
  cmd: string;
  /** 指令执行内容 */
  cmdExcuter: ( context: ExtensionContext ) => void;
}