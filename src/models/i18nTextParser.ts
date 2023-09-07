import { Position, Range, TextDocument, } from "vscode";
import { FORMAT_MESSAGE_ID_REGEX } from 'utils/code';
import { adjustNumberRange } from 'utils/num';
import { I18nTextParse, I18nTextParseIsPluginThisSupportOptions, I18nTextParsePlugin } from "types/index";

class BaseI18nTextParsePllugin implements I18nTextParsePlugin {
    context: I18nTextParse;
    partReg: RegExp = FORMAT_MESSAGE_ID_REGEX;
    wholeRule: RegExp = FORMAT_MESSAGE_ID_REGEX;
    generateTemplate: string = "formatMessage({\nid: ${id},\nmsg: ${msg},\n})";
    matchValue: string | undefined | null;

    constructor(host: I18nTextParse) {
        this.context = host;
    }
    get isThisPlugin(): boolean {
        return this.context.isPluginThisSupported({
            partReg: this.partReg,
            wholeRule: this.wholeRule,
            matchTextCb: (text) => this.matchValue = text,
        });
    };
    getMatchI18nKey() {
        return this.matchValue!;
    };
};


export class I18nTextParserClass implements I18nTextParse {
    document: TextDocument;
    currentPosition: Position;
    plugins: BaseI18nTextParsePllugin[];

    constructor(document: TextDocument, currentPosition: Position) {
        this.document = document;
        this.currentPosition = currentPosition;
        this.plugins = [
            new BaseI18nTextParsePllugin(this),
        ];
    }

    getMatchI18nKey(): string | null {
        const plugin = this.plugins.find(plugin => plugin.isThisPlugin);
        if (plugin) {
            return plugin.getMatchI18nKey();
        }
        return null;
    }

    getRangeTextFromProvider(line: number): string {
        const curPos = this.currentPosition;
        const doucment = this.document;

        const startLine = doucment.lineAt(curPos.line - line)
        const startPosition = doucment.validatePosition(startLine.range.start);
        const endLine = doucment.lineAt(curPos.line + line);
        const endPositon = doucment.validatePosition(endLine.range.end);

        const range = doucment.validateRange(new Range(startPosition, endPositon));
        const rangeText = this.getformatText2Parse(doucment.getText(range));
        return rangeText;
    }

    getLineText(): string {
        const { document, currentPosition } = this;
        const line = document.lineAt(currentPosition);
        return this.getformatText2Parse(line.text);
    }

    isPluginThisSupported(options: I18nTextParseIsPluginThisSupportOptions): boolean {
        const {
            diffuse = 0,
            partReg,
            wholeRule,
            matchTextCb,
        } = options;
        const diffuseVal = adjustNumberRange(diffuse?? 0, 0, 2);
        const lineText = this.getLineText();
        const isPartPassTest = partReg.test(lineText);

        if (!isPartPassTest) { return false; };
        const isSupportMoreCheck = !!diffuse;
        if (!isSupportMoreCheck) { 
            const matchText = lineText.match(wholeRule)?.[0];
            if (matchText) { matchTextCb(matchText); };
            return !!matchText;
         };

        for (let line = 1; line <= diffuseVal; line++) {
            const rangeText = this.getRangeTextFromProvider(line);
            const isWholePasssTest = wholeRule.test(rangeText);

            if (!isWholePasssTest) { continue; };

            const wholePassResult = rangeText.match(wholeRule)![0];
            const isInludeLineText = wholePassResult.includes(lineText);
            if (!isInludeLineText) { continue; };
            if (isWholePasssTest && isInludeLineText) { 
                matchTextCb(wholePassResult);
                return true;
             }
        };

        return false;
    }

    getformatText2Parse(str: string): string {
        return str.replace(/\s/g, '');
    }
};