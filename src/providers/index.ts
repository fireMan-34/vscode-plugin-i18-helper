
import { ExtensionContext } from 'vscode';
import { createI18nCompetionItemProvider } from 'providers/completionItem';

/** 插件 i18n 提供服务 */
export const createI18nProvider = (context: ExtensionContext) => {
    [createI18nCompetionItemProvider].forEach(registerProvider => {
        context.subscriptions.push(registerProvider(context));
    });
};