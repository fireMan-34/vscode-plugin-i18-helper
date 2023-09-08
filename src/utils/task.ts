import { commands, workspace, type ExtensionContext, window } from 'vscode';
import { refreshI18nConfigJson, GlobalExtensionSubject } from 'utils/conf';
import { isSubPath } from 'utils/path';
import { EXTENSION_NAME, VSCODE_KEYS_MAP } from 'constants/index';

/** 扫描国际化上下文任务 */
export const refreshScan18FileTaskContext = (context: ExtensionContext) => {
  const scanFolders = workspace.getConfiguration(EXTENSION_NAME).get(VSCODE_KEYS_MAP.scanFolders);
  commands.executeCommand('setContext', 'i18n.supportedFolders', scanFolders);
};

/** 刷新配置上下文
 * @see https://code.visualstudio.com/api/references/when-clause-contexts
 */
export const refreshContextTask = (context: ExtensionContext) => {
  refreshI18nConfigJson(context, { refreshType: 'read', isSave: true, });
  refreshScan18FileTaskContext(context);
};

/** 订阅 vscode 插件配置变更
 * @see https://code.visualstudio.com/api/references/contribution-points#contributes.configuration
 * @see 
 */
export const createConfgiChangeSubscript = (context: ExtensionContext) => {
  return workspace.onDidChangeConfiguration((ev) => {
      const isNeedRefresh = ev.affectsConfiguration(EXTENSION_NAME);
      if (!isNeedRefresh) { return; };
      refreshContextTask(context);
  });
};

/** 判断当前文件是否在国际化目录中
 * * workspace
 * ! onDidChangeTextDocument 这个是监听用户修改文件的并非监听文件切换的。
 * ! onDidOpenTextDocument 打开后就不再触发
 */
export const createSelectionChangeSubscript = (context: ExtensionContext) => {
  return window.onDidChangeActiveTextEditor(editor => {
    if (!editor) { return; };
    const { i18nDirList } =  GlobalExtensionSubject.getValue();
    const isInI18nDirOne = i18nDirList
    .map((dir) => dir.originalPath)
    .some(path => isSubPath(path, editor.document.uri.fsPath));
    commands.executeCommand('setContext', 'i18n.isInI18nDirOne' , isInI18nDirOne );
  });
};