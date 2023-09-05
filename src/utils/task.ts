import { commands, workspace, type ExtensionContext } from 'vscode';
import { refreshI18nConfigJson } from 'utils/conf';
import { EXTENSION_NAME, VSCODE_KEYS_MAP } from 'constants/index';

/** 扫描国际化上下文任务 */
export const refreshScan18FileTaskContext = (context: ExtensionContext) => {
  const scanFolders = workspace.getConfiguration(EXTENSION_NAME).get(VSCODE_KEYS_MAP.scanFolders);
  commands.executeCommand('setContext', 'ext.supportedFolders', scanFolders);
};

/** 刷新配置上下文 */
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