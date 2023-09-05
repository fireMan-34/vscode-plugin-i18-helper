
import { ExtensionContext } from 'vscode';
import { createI18nCompetionItemProvider } from 'providers/completionItem';
import { createDefinitionProvider } from 'providers/define';

/** 插件 i18n 提供服务 */
export const createI18nProvider = (context: ExtensionContext) => {
    [
        createI18nCompetionItemProvider,
        createDefinitionProvider,
    ].forEach(registerProvider => {
        context.subscriptions.push(registerProvider(context));
    });
};