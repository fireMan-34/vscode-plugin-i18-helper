import { ExtensionContext } from 'vscode';

import { rescanI18nFileContentJson } from 'models/i18nFileItem';
import { ClipboardSubscription, createClipboardTask } from 'utils/clipboard.code';
import { GlobalExtensionSubscription, } from 'utils/conf';
import { LoggerSubscription } from 'utils/log';
import { createDisableFromSubscription } from 'utils/rxHelper';
import { createConfgiChangeSubscript, createSelectionChangeSubscript, createTextEditofrChangeSubscript, initScanCurrentLocals } from 'utils/task';

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
    ClipboardSubscription
  ]
    .forEach(subscription => createDisableFromSubscription(subscription, context));

  // * 初始化 国际化扫描数据初始化
  await rescanI18nFileContentJson(context);
  // * 重新加载初始化国际代码
  await initScanCurrentLocals(context);

  // * 创建读取剪切板自动生成国际化代码
  createClipboardTask();
};