import { ExtensionContext } from 'vscode';
import { createDisableFromSubscription } from 'utils/rxHelper';
import { LoggerSubscription } from 'utils/log';
import { GlobalExtensionSubscription } from 'utils/conf';


export const createTotalRxSubscriptionDisable = (context: ExtensionContext) => {
  [
    LoggerSubscription, 
    GlobalExtensionSubscription,
  ]
  .forEach(subscription => createDisableFromSubscription(subscription, context));
};