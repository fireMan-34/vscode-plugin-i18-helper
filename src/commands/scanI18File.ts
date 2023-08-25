import * as vscode from "vscode";
import type { ICommondItem } from './type';

/** 扫描国际化文件 */
const SCAN_I18_FILE = 'i18.scanI18File';

/** 扫描国际化文件 */
const scanI18File = (context: vscode.ExtensionContext) => {
  
};
/** 注册扫描文件上下文
 * @see https://code.visualstudio.com/api/references/when-clause-contexts
 */
const excuter = (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage('扫描文件已执行');
  vscode.commands.executeCommand('setContext', 'ext.supportedFolders', [ 'dist', 'out' ]);
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: SCAN_I18_FILE,
  cmdExcuter: scanI18File,
  excuter,
};
export default item;

export {
  SCAN_I18_FILE,
  scanI18File,
  excuter,
};