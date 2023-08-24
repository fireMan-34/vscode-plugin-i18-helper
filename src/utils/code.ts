import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Uri, type ExtensionContext, type WebviewPanel } from 'vscode';

/** 从键值对字符串·里解析对象
 * @param {string} text 键值对字符串
 * @return {object} 键值对创建的对象
 */
const parseKeyAndValTexts2Object = (text: string): object => {
	const evalCode = `({${text}})`;
	return eval(evalCode);
};
/**
 *获取 webView 内容
 *
 * @return {*} 
 */
const getWebViewContent = (context:  ExtensionContext, panel: WebviewPanel) => {
	const path = join(__dirname, './index.html');
	const mainPath = Uri.joinPath(context.extensionUri, 'out' , 'main.js');
	const mainScript = panel.webview.asWebviewUri(mainPath);
	const html = readFileSync(path, 'utf8').replace('main.js', mainScript as unknown as string);
	// console.log('路径', mainPath.path, mainPath.fsPath);
	// console.log('视图数据', mainScript.path, mainScript.fsPath);
	// console.log('页面状态', html);
	return html;
};

export {
  parseKeyAndValTexts2Object,
	getWebViewContent,
};