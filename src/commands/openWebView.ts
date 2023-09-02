import vscode from "vscode";
import { getWebViewContent } from 'utils/code';
import type { ICommondItem } from 'types/index';
import { CMD_KEY } from 'constants/index';

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
  cmd: CMD_KEY.OPEN_WEB_VIEW_CMD,
  cmdExcuter: openWebView,
};
export default item;