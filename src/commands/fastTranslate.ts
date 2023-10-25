import vscode from "vscode";
import { Certificate, Cipher } from 'crypto';
import type { ICommondItem } from 'types/index';
import { CMD_KEY, } from 'constants/index';
import { I18nType } from 'types/index';
import { getGlobalConfiguration } from 'utils/conf';

/** crypto 模块大类笔记
 * 
 * Certificate 证明书
 * 
 * Cipher 加密 密文
 */

interface ITransalteOutItem {
  penddingText: string;
  transalteEngineLanguageType: keyof typeof I18nType;
  transalteText: string;
}

class TranslateEngine {
  translate(penddingText: string, transalteEngineLanguageTypes:( keyof typeof I18nType)[]): ITransalteOutItem[] {
    return [
      {
        penddingText,
        transalteEngineLanguageType: transalteEngineLanguageTypes[0],
        transalteText: '翻译后的文本',
      }
    ];
  }

  createSign(...args: unknown[]) {
    return '';
  }
};

class BaiduTranslateEngine extends TranslateEngine {
  baseApi = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

  appId = '';

  appSecrect = '';

  salt = Math.ceil( Math.random() * 1000);

  createSign(
    penddingText: string,


  ): string {
    const step1 = `${this.appId}${penddingText}${this.salt}${this.appSecrect}`;

    
    
    return step1;
  }
}

const transalteEngineMap = new Map<string, TranslateEngine>();

/** 快速翻译单个文本 */
const fastTranslate = async (context: vscode.ExtensionContext, ...args: any[]) => {
  console.log('翻译输入参数', args);

  /** 待翻译文本 */
  const penddingText = '';

  const {
    fastTranslateLanguageType,
    translateEngine,
  } =  await getGlobalConfiguration();

  const transalteEngine = transalteEngineMap.get(translateEngine);

  if (!transalteEngine) {
    return;
  }

  const result = await transalteEngine.translate(penddingText, fastTranslateLanguageType);

  // mock 不下去了，后面这一段需要设计用户如何使用，
  
  return result;
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: CMD_KEY.FAST_TRANSLATE,
  cmdExcuter: fastTranslate,
};
export default item;