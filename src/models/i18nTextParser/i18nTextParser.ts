import { Position, Range, TextDocument, } from "vscode";
import { adjustNumberRange } from 'utils/num';
import { GlobalExtensionSubject } from 'utils/conf';
import { BaseI18nTextParsePlugin } from 'models/i18nTextParser/index';
import { I18nTextParse, I18nTextParseIsPluginThisSupportOptions } from "types/index";


/*** i18n 代码解析对象 */
export class I18nTextParserClass implements I18nTextParse {
    document: TextDocument;
    currentPosition: Position;
    plugins: BaseI18nTextParsePlugin[];

    constructor(document: TextDocument, currentPosition: Position) {
        this.document = document;
        this.currentPosition = currentPosition;
        this.plugins = [];
    }

    getMatchI18nText(): string | null {
        const curTemplate = GlobalExtensionSubject.getValue().generateTemplate;
        const plugin = this.plugins
        .filter(plugin => plugin.generateTemplate.includes(curTemplate))
        .find(plugin => plugin.isThisPlugin);
        if (plugin) {
            return plugin.getMatchI18nText();
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