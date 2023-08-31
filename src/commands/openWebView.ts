import vscode from "vscode";
import { getWebViewContent } from 'utils/code';
import type { ICommondItem } from './type';

/** 打开界面视图指令 */
const OPEN_WEB_VIEW_CMD = 'i18n.openWebView';

/** 打开页面 */
const openWebView = (context: vscode.ExtensionContext) => {
  const panel = vscode.window.createWebviewPanel('i18nWebView', 'i18n web view', vscode.ViewColumn.One, {
    enableScripts: true,
    localResourceRoots: [ vscode.Uri.joinPath(context.extensionUri, 'out') ]
  });
  panel.webview.html = getWebViewContent(context, panel);
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: OPEN_WEB_VIEW_CMD,
  cmdExcuter: openWebView,
};
export default item;

export {
  OPEN_WEB_VIEW_CMD,
  openWebView,
};