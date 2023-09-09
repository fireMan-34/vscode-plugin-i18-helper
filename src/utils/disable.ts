import { ExtensionContext } from 'vscode';
import { createDisableFromSubscription } from 'utils/rxHelper';
import { LoggerSubscription } from 'utils/log';
import { GlobalExtensionSubscription, } from 'utils/conf';
import { createConfgiChangeSubscript, createSelectionChangeSubscript } from 'utils/task';
import 'utils/log.code';

/** 资源释放处理 */
export const createTotalRxSubscriptionDisable = (context: ExtensionContext) => {
  // * vscode 资源释放
  [
    createConfgiChangeSubscript,
    createSelectionChangeSubscript,
  ].forEach(createDisable => context.subscriptions.push(createDisable(context)));

  // * Rxjs 资源释放
  [
    LoggerSubscription,
    GlobalExtensionSubscription,
  ]
    .forEach(subscription => createDisableFromSubscription(subscription, context));
};