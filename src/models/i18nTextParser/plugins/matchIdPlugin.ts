/** @fileoverview 匹配国际化 key 相关 */
import { GENERATE_TEMPLATE_MAP } from 'constants/index'
import { FORMAT_MESSAGE_ID_REGEX, } from 'constants/index';
import { I18nTextParse } from 'types/index';
import { BaseI18nTextParsePlugin } from './base';

/**
 * 匹配关键 key 主要用于自定义跳转、智能悬浮信息等
 */
export class FormatMessageWithKeyAndValMatchIdPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }
  generateTemplate: string[] = [GENERATE_TEMPLATE_MAP.FORMAT_MESSAGE_WITH_KEY, GENERATE_TEMPLATE_MAP.FORMAT_MESSSAGE_WITH_KEY_VAL];
  partReg: RegExp = FORMAT_MESSAGE_ID_REGEX;
  wholeRule: RegExp = FORMAT_MESSAGE_ID_REGEX;
  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text.match(this.wholeRule)?.[1];
  };
}

export const createMatchI18nIdPlugin = (host: I18nTextParse) => {
  host.plugins = [
    new FormatMessageWithKeyAndValMatchIdPlugin(host),
  ];
};