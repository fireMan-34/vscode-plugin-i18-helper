// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode';
import formatMessageCmd from 'commands/parseKeyAndValue2FormatMessage';
import openWebViewCmd from 'commands/openWebView';
import scanI18FileCmd from 'commands/scanI18File';
import i18nRuleDirCmd from 'commands/i18nRuleDir';
import fastTranslateCmd from 'commands/fastTranslate';
import { createI18nProvider } from 'providers/index';
import { createTotalRxSubscriptionDisable } from 'utils/disable';
import { refreshContextTask } from 'utils/task';
import type { XTextEditor } from 'types/index';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// 激活事件 插件一开始不一定会启动
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('你的国际化插件已经可以预览啦啦， 😊');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const commands = [
		formatMessageCmd,
		openWebViewCmd,
		scanI18FileCmd,
		i18nRuleDirCmd,
		fastTranslateCmd,
	];
	const disposables = commands
		.map((cmdItem) =>
			vscode.commands.registerCommand(cmdItem.cmd,
				(...args: any[]) =>
					cmdItem.cmdExcuter(context,
						args[0] as XTextEditor,
						args[1] as vscode.TextEditorEdit,
						...args.slice(2,))));
	context.subscriptions.push(...disposables);
	commands.filter(cmd => cmd.excuter).forEach(cmd => cmd.excuter!(context));

	createI18nProvider(context);

	createTotalRxSubscriptionDisable(context);

	refreshContextTask(context);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
