import { ExtensionContext } from 'vscode';
import { createDisableFromSubscription } from 'utils/rxHelper';
import { LoggerSubscription } from 'utils/log';
import { GlobalExtensionSubscription, } from 'utils/conf';
import { createConfgiChangeSubscript } from 'utils/task';

/** 资源释放处理 */
export const createTotalRxSubscriptionDisable = (context: ExtensionContext) => {
  // * vscode 资源释放
  [createConfgiChangeSubscript,].forEach(createDisable => context.subscriptions.push(createDisable(context)));
  
  // * Rxjs 资源释放
  [
    LoggerSubscription,
    GlobalExtensionSubscription,
  ]
    .forEach(subscription => createDisableFromSubscription(subscription, context));
};