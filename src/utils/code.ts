import { readFileSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Uri, type ExtensionContext, type WebviewPanel } from 'vscode';
import template from 'lodash/template';
import { sify } from 'chinese-conv';
import { GlobalExtensionSubject } from 'utils/conf';
import { I18nType } from 'types/index';

const CHINESE_LANGUAGE_REG = /[\u4e00-\u9fa5]/g;

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
 * 判断字符串属于什么国际化 中文繁体、中文简体、日文大概率错误判断
 * 判断是以总体为单位所以判断串位的可能性比较多
 * 中简，中繁，日文部分文字存在重合部分
 * @param code 
 * @returns {I18nType}
 * @todo 添加总体字数判定
 */
const getCharsI18nType = (code: string): I18nType => {
	if (code.match(/[\u0800-\u4e00]/g)) {
		return I18nType.JA_JP;
	}
	if (code.match(CHINESE_LANGUAGE_REG)) {
		// 存在繁体
		// 简体
		const transformSimpleText = sify(code);
		if (code === transformSimpleText) {
			return I18nType.ZH_CN;
		}
		return I18nType.ZH_HK;
	}
	if (code.match(/[\uac00-\ud7ff]/g)) {
		return I18nType.KO_KR;
	}
	if (code.match(/[a-zA-Z]/g)) {
		return I18nType.EN_US;
	}
	return I18nType.UN_KNOWN;
};

/** 动态嵌入变量值模板，目前只支持对象单个映射
 * @version 1.0 
 */
const generateDynamicTemplateString = (code: string, context: Record<string, string|boolean|number>) => {
	return template(code, {
	})(context);
};

const renderI18nCode = (i18nItem: { id: string, msg: string }) => {
	const { generateTemplate: codeTemplate } = GlobalExtensionSubject.getValue();
	return generateDynamicTemplateString(codeTemplate, i18nItem);
};

/** 匹配正则
 * @description 键值对后面触发提示
 */
const FORMAT_MESSAGE_REGEX = /formatMessage\(\{\s*/;

const FORMAT_MESSAGE_ID_REGEX = /["']?id["']?\s*:\s*["']([^"']*)?["']/;


export {
	parseKeyAndValTexts2Object,
	getWebViewContent,
	getCharsI18nType,
	generateDynamicTemplateString,
	renderI18nCode,
	FORMAT_MESSAGE_REGEX,
	FORMAT_MESSAGE_ID_REGEX,
};