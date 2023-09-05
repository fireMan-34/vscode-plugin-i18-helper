import { Disposable, ExtensionContext } from 'vscode';
import { Subscription } from 'rxjs/internal/Subscription';

/** 将 Rxjs 卸载前释放 */
export const createDisableFromSubscription = (subscription: Subscription, context: ExtensionContext) => {
  context.subscriptions.push(new Disposable(() => subscription.unsubscribe()));
};