import { readFileSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Uri, type ExtensionContext, type WebviewPanel } from 'vscode';
import template from 'lodash/template';
import isEmpty from 'lodash/isEmpty';
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
		interpolate: /{{([\s\S]+?)}}/g,
	})(context);
};

const renderI18nCode = (i18nItem: { id: string, msg: string, isRemoveBracket?: boolean, isRemoveBrace?: boolean }) => {
	const {
		/** 是否移除括号以及括号外内容 */
		isRemoveBracket = false,
		/** 是否移除花括号以及花括号外内容 */
		isRemoveBrace = false,
	} = i18nItem;
	const { generateTemplate: codeTemplate } = GlobalExtensionSubject.getValue();
	let i18nCode = generateDynamicTemplateString(codeTemplate, i18nItem);
		if (isRemoveBracket) {
			i18nCode = i18nCode.replace(/.*\(/, '').replace(/\).*/, '');
		}
		if (isRemoveBrace) {
			i18nCode = i18nCode.replace(/.*\{/, '').replace(/\}.*/g, '');
		}

	return i18nCode;
};

/** 动态模板转匹配正则 */
export function generateTemplateStringToRegex(generateTemplateStr: string) {
	function toReg(str: string) {
		return str
		.replace('{', '\\{')
		.replace('}', '\\}')
		.replace('(','\\(')
		.replace(')', '\\)')
		.replace('[','\\[')
		.replace(']','\\]')
		;
	}
	let generateTemplate = generateTemplateStr;
	const variableReg = /'\{\{.*?\}\}'/g;
	const keyIndex = 1;
	const valIndex = 3;
	/** [x][x][x]  */
	const withRegFormatStrs = generateTemplateStr.split(variableReg).map(toReg);
	const replaceKeyValRegStrs = withRegFormatStrs;
	const [ keyWithStr, msgWithStr  ] = generateTemplate.match(variableReg) || [];
	if (keyWithStr) {
		/** [x][o][x][x]  */
		replaceKeyValRegStrs.splice(keyIndex,0, `("|')(.*?)\\1`);
	}
	if (keyWithStr && msgWithStr) {
		replaceKeyValRegStrs.splice(valIndex, 0, `("|')(.*?)\\3,?`);
	}
	const waitJoinRegStrs = replaceKeyValRegStrs.flatMap((v,i, a) => i < a.length - 1 ? [ v, `[\\s|\\n]*` ] : [v]);
	const [ partRegStr ] = waitJoinRegStrs;
	const fullRegStr = waitJoinRegStrs.join('');

	return {
		/** 识别国际化正则文本 */
		partRegStr,
		/** 全匹配国际正则文本 */
		fullRegStr: fullRegStr,
		/** 国际化局部正则 */
		partReg: new RegExp(partRegStr, 'm'),
		/** 国际化全部正则 */
		fullReg: new RegExp(fullRegStr, 'm'),
		getI18nKeyAndVal(i18nCode: string) {
			const reg = new RegExp(fullRegStr, 'gm');
			const [matchAllArr = []] = i18nCode.matchAll(reg) || [];
			if (isEmpty(matchAllArr)) {
				return {};
			}
			const key = matchAllArr[keyIndex + 1];
			const val = matchAllArr[valIndex + 1];
			return {
				key,
				val,
			};
		},
	} as const;
};




export {
	parseKeyAndValTexts2Object,
	getWebViewContent,
	getCharsI18nType,
	generateDynamicTemplateString,
	renderI18nCode,
};