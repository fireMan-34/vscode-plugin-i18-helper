import { readFileSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Uri, type ExtensionContext, type WebviewPanel } from 'vscode';
import { I18nType } from 'commands/type';

/** 从键值对字符串·里解析对象
 * @param {string} text 键值对字符串
 * @return {object} 键值对创建的对象
 */
const parseKeyAndValTexts2Object = (text: string): object => {
	try {
		const evalCode = `({${text}})`;
		return eval(evalCode);
	} catch (error) {
		writeFile(join(__dirname, 'err.log'), text, { encoding: 'utf-8' }, () => { });
		return {};
	}
};
/**
 *获取 webView 内容
 *
 * @return {*} 
 */
const getWebViewContent = (context: ExtensionContext, panel: WebviewPanel) => {
	const path = join(__dirname, './index.html');
	const mainPath = Uri.joinPath(context.extensionUri, 'out', 'main.js');
	const mainScript = panel.webview.asWebviewUri(mainPath);
	const html = readFileSync(path, 'utf8').replace('main.js', mainScript as unknown as string);
	// console.log('路径', mainPath.path, mainPath.fsPath);
	// console.log('视图数据', mainScript.path, mainScript.fsPath);
	// console.log('页面状态', html);
	return html;
};

/**
 * 判断字符串属于什么国际化 有概率错误判断
 * @param code 
 * @returns {I18nType}
 */
const getCharsI18nType = (code: string): I18nType => {
	if (code.match(/[\u4E00-\u9FFF]/g)) {
		// 存在繁体
		if (code.match(/[\u3402\u3401\u3404\u3405\u3406\u340C\u340D\u3415\u3418\u341B\u341E\u3428\u3435\u3438\u3439\u343C\u343D\u3446\u3447\u344E\u345A\u3461\u3473\u347A\u347D\u3481\u3486\u348C\u3493\u3497]/g)) {
			return I18nType.ZH_HK;
		}
		// 简体
		return I18nType.ZH_CN;
	}
	if (code.match(/[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]/g)) {
		return I18nType.JA_JP;
	}
	if (code.match(/[x3130-x318F]/)) {
		return I18nType.KO_KR;
	}
	if (code.match(/[a-zA-Z]g/)) {
		return I18nType.EN_US;
	}
	return I18nType.UN_KNOWN;
};


export {
	parseKeyAndValTexts2Object,
	getWebViewContent,
	getCharsI18nType,
};