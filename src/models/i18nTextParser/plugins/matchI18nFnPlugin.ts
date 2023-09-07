import { FORMAT_MESSAGE_REGEX, GENERATE_TEMPLATE_MAP } from 'constants/index';
import { I18nTextParse } from 'types/index';
import { BaseI18nTextParsePlugin } from './base';

export class FormatMessageWithKeyAndValMatchFnPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }
  
  generateTemplate: string[] = [ GENERATE_TEMPLATE_MAP.FORMAT_MESSAGE_WITH_KEY, GENERATE_TEMPLATE_MAP.FORMAT_MESSSAGE_WITH_KEY_VAL ];
  partReg: RegExp = FORMAT_MESSAGE_REGEX;
  wholeRule: RegExp = FORMAT_MESSAGE_REGEX;
}

export const createMatchI18nFnPlugin = (host: I18nTextParse) => {
  host.plugins = [
    new FormatMessageWithKeyAndValMatchFnPlugin(host),
  ];
};