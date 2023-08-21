// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { range } from 'lodash';

/** 起始结束映射行属性 */
const rangeFix = (start: number, end: number) => {
	return start === end ? [start] : range(start, end);
};
/** 从代码里解析对象 */
const parseAttributeTexts2Object = (text: string) => {
	const evalCode = `({${text}})`;
	return eval(evalCode);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('i18.formatMessage', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const emptyWarning = (msg?: string) => {
			vscode.window.showWarningMessage(`当前${msg || '上下文'}为空`);
		};

		// * 任务分解
		// * 1. 获取选中代码 键值对 - [x]
		// * 2. 映射快捷后代码 -[x]
		// * 3. 映射到剪贴板 -[x]
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			emptyWarning();
			return;
		};
		/** 当前文档对象 */
		const document = editor.document;
		/** 当前行对象 */
		const { selection } = editor;
		/** 起止行数 */
		const line = {
			start: selection.start.line,
			end: selection.end.line,
		};
		const rangeLine = rangeFix(line.start, line.end);
		
		const formatMessage =  rangeLine.map((l, i) => {
			const keyAndValText = document.lineAt(l).text;
			const object = parseAttributeTexts2Object(keyAndValText);

			const formatMessageFromLine = Object.entries(object).map(([i18Key, i18Msg]) => `formatMessage({
				id: '${i18Key}',
				defaultMessage: '${i18Msg}',
			})`).join('');

			return formatMessageFromLine;
		}).join('');

		const clipboard = vscode.env.clipboard;
		clipboard.writeText(formatMessage);
		vscode.window.showInformationMessage('国际化代码已经生成到剪切板');
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
