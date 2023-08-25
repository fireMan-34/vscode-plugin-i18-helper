import type { ExtensionContext  } from 'vscode';

/** 指令内容 */
export interface ICommondItem {
  /** 指令文本 */
  cmd: string;
  /** 指令执行内容 */
  cmdExcuter: ( context: ExtensionContext ) => void;
  /** 激活后回调执行
   * 存在一定的问题
   * ? 比方说不调用命令就不执行
   */
  excuter?: ( context: ExtensionContext ) => void;
}