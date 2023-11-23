import { I18nTextParsePlugin, I18nTextParse } from "types/index";

export class BaseI18nTextParsePlugin implements I18nTextParsePlugin {
  context: I18nTextParse;
  partReg!: RegExp;
  wholeRule!: RegExp;
  generateTemplate!: string[];
  matchValue: string | undefined | null;

  constructor(host: I18nTextParse) {
      this.context = host;
      this.init();
  }
  get isThisPlugin(): boolean {
      return this.context.isPluginThisSupported({
          partReg: this.partReg,
          wholeRule: this.wholeRule,
          matchTextCb: this.matchTextCb,
      });
  };
  getMatchI18nText() {
      return this.matchValue!;
  };

  matchTextCb: (text: string) => void = (text: string) => {
    this.matchValue = text;
  };

  init() {

  }
};