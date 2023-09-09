import type { TextEditor, ExtensionContext, TextEditorEdit } from "vscode";

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