/** @fileoverview 匹配国际化 key 相关 */
import { $_T_KEY_REGEX, FORMAT_MESSAGE_ID_MSG_REGEX, FORMAT_MESSAGE_MSG_REGEX, GENERATE_TEMPLATE_MAP, I18N_T_KEY_REGEX } from 'constants/index';
import { FORMAT_MESSAGE_ID_REGEX, } from 'constants/index';
import { I18nTextParse } from 'types/index';
import { getVScodeConfig } from 'utils/conf';
import { generateTemplateStringToRegex } from 'utils/code';
import { BaseI18nTextParsePlugin } from './base';

/**
 * 匹配关键 key 主要用于自定义跳转、智能悬浮信息等
 */
export class FormatMessageWithKeyAndValMatchIdPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }
  generateTemplate: string[] = [
    GENERATE_TEMPLATE_MAP.FORMAT_MESSAGE_WITH_KEY,
    GENERATE_TEMPLATE_MAP.FORMAT_MESSSAGE_WITH_KEY_VAL,
    GENERATE_TEMPLATE_MAP.INT_FORMAT_MESSAGE_WITH_KEY,
    GENERATE_TEMPLATE_MAP.INT_FORMAT_MESSAGE_WITH_KEY_VAL,
  ];
  partReg: RegExp = FORMAT_MESSAGE_ID_REGEX;
  wholeRule: RegExp = FORMAT_MESSAGE_ID_REGEX;
  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text.match(this.wholeRule)?.[1];
  };
}

export class FormatMessageWithDefaultMessageMatchIdPlugin extends BaseI18nTextParsePlugin {
  generateTemplate: string[] = [
    GENERATE_TEMPLATE_MAP.FORMAT_MESSSAGE_WITH_KEY_VAL,
    GENERATE_TEMPLATE_MAP.INT_FORMAT_MESSAGE_WITH_KEY_VAL,
  ];

  partReg: RegExp = FORMAT_MESSAGE_MSG_REGEX;
  wholeRule: RegExp = FORMAT_MESSAGE_ID_MSG_REGEX;

  get isThisPlugin() {
    return this.context.isPluginThisSupported({
      partReg: this.partReg,
      wholeRule: this.wholeRule,
      diffuse: 2,
      matchTextCb: this.matchTextCb,
    });
  }

  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = Array.from(text.matchAll(this.wholeRule))[0][2] ?? '';
  };
}

export class I18nTWithKeyMatchIdPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }

  generateTemplate: string[] = [
    GENERATE_TEMPLATE_MAP.I18N_T_WITH_KEY,
  ];

  partReg: RegExp = I18N_T_KEY_REGEX;
  wholeRule: RegExp = I18N_T_KEY_REGEX;

  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text.match(this.wholeRule)![1];
  };
}

export class $TWhthKeyMatchIdPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }

  generateTemplate: string[] = [ GENERATE_TEMPLATE_MAP.$T_WITH_KEY ];

  partReg: RegExp = $_T_KEY_REGEX;
  wholeRule: RegExp = $_T_KEY_REGEX;

  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text.match(this.wholeRule)![1];
  };
}

export class dynamicTemplateMatchIdPlugin extends BaseI18nTextParsePlugin {
  constructor(host: I18nTextParse) {
    super(host);
  }

  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text.match(this.wholeRule)![1];
  };

  init() {
    const { generateTemplate, } = getVScodeConfig();
    const regexper = generateTemplateStringToRegex(generateTemplate);
    this.partReg = regexper.partReg;
    this.wholeRule = regexper.fullReg;
  }
}

export const createMatchI18nIdPlugin = (host: I18nTextParse) => {
  host.plugins = [
    new FormatMessageWithKeyAndValMatchIdPlugin(host),
    new FormatMessageWithDefaultMessageMatchIdPlugin(host),
    new I18nTWithKeyMatchIdPlugin(host),
    new $TWhthKeyMatchIdPlugin(host),
    new dynamicTemplateMatchIdPlugin(host),
  ];
};