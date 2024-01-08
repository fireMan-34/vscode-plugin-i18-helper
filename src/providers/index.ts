
import { ExtensionContext } from 'vscode';
// import { createI18nCompetionItemProvider } from 'providers/completionItem';
// import { createDefinitionProvider } from 'providers/define';
// import { createHoverProvider } from 'providers/hover';
import { createTreeI18nMapDirProvider } from 'providers/i18nMapDir';
import { createI18nMapConfig } from 'providers/i18nMapConfig';
import createAstHoverProvider from 'providers/hover.1';
import { createAstDefinitionProvider } from 'providers/define.1';
import { createI18nCompetionItemProvider, } from 'providers/completionItem.1';

/** 插件 i18n 提供服务 */
export const createI18nProvider = (context: ExtensionContext) => {
    [
        // createI18nCompetionItemProvider,
        // createDefinitionProvider,
        // createHoverProvider,
        createTreeI18nMapDirProvider,
        createI18nMapConfig,
        createAstHoverProvider,
        createAstDefinitionProvider,
        createI18nCompetionItemProvider,
    ].forEach(registerProvider => {
        context.subscriptions.push(registerProvider(context));
    });
};