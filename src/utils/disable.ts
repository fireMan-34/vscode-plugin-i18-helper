import { ExtensionContext } from 'vscode';
import { createDisableFromSubscription } from 'utils/rxHelper';
import { LoggerSubscription } from 'utils/log';
import { GlobalExtensionSubscription, } from 'utils/conf';
import { createConfgiChangeSubscript, createSelectionChangeSubscript, createTextEditofrChangeSubscript , initScanCurrentLocals } from 'utils/task';
import { rescanI18nFileContentJson } from 'models/i18nFileItem';
import 'utils/log.code';

/** 资源释放处理 */
export const createTotalRxSubscriptionDisable = async (context: ExtensionContext) => {
  // * vscode 资源释放
  [
    createConfgiChangeSubscript,
    createSelectionChangeSubscript,
    createTextEditofrChangeSubscript,
  ].forEach(createDisable => context.subscriptions.push(createDisable(context)));

  // * Rxjs 资源释放
  [
    LoggerSubscription,
    GlobalExtensionSubscription,
  ]
    .forEach(subscription => createDisableFromSubscription(subscription, context));

  // * 初始化 国际化扫描数据初始化
  await rescanI18nFileContentJson(context);
  // * 重新加载初始化国际代码
  await initScanCurrentLocals(context);
};