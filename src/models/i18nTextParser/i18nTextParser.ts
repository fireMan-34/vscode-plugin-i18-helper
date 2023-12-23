import { Position, Range, TextDocument, window } from "vscode";

import { BaseI18nTextParsePlugin } from 'models/i18nTextParser/index';
import { I18nTextParse, I18nTextParseIsPluginThisSupportOptions } from "types/index";
import { GlobalExtensionSubject } from 'utils/conf';
import { adjustNumberRange } from 'utils/num';
import { findStartAndEndIndex, formatCodeText } from "utils/str";


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
        try {
            const curTemplate = GlobalExtensionSubject.getValue().generateTemplate;
            const plugin = this.plugins
                .filter(plugin => plugin.generateTemplate.includes(curTemplate))
                .find(plugin => plugin.isThisPlugin);
                  
            if (plugin) {
                return plugin.getMatchI18nText();
            }
            return null;
        } catch (err) {
            console.log('get match i18n text error', err);
            
            return null;
        }
    }

    getRangeTextFromProvider(line: number): string {
        const curPos = this.currentPosition;
        const doucment = this.document;

        const startLine = doucment.lineAt(curPos.line - line);
        const startPosition = doucment.validatePosition(startLine.range.start);
        const endLine = doucment.lineAt(curPos.line + line);
        const endPositon = doucment.validatePosition(endLine.range.end);

        const range = doucment.validateRange(new Range(startPosition, endPositon));
        const rangeText = this.getFormatText2Parse(doucment.getText(range));
        return rangeText;
    }

    getLineText(): string {
        const { document, currentPosition } = this;
        const line = document.lineAt(currentPosition);
        return this.getFormatText2Parse(line.text);
    }

    isPluginThisSupported(options: I18nTextParseIsPluginThisSupportOptions): boolean {
        const {
            diffuse = 0,
            partReg,
            wholeRule,
            matchTextCb,
        } = options;
        const diffuseVal = adjustNumberRange(diffuse ?? 0, 0, 2);
        const lineText = this.getLineText();
        const isPartPassTest = partReg.test(lineText);
        const line = this.currentPosition.line;
        const doucment = this.document;

        if (!isPartPassTest) { return false; };
        const isSupportMoreCheck = !!diffuse;
        if (!isSupportMoreCheck) {
            let lineMatchText = lineText;
            const matchPartResult = lineText.match(new RegExp(partReg, 'g'))!;
            const hasMorePartResult = matchPartResult.length > 1;
            if (hasMorePartResult) {
                const matchRanges = matchPartResult
                    .map((item) => ({ text: item, range: findStartAndEndIndex(lineMatchText, item)! }))
                    .map(({ text, range: [start, end] }) => ({ 
                        text, 
                        range: new Range(new Position(line, start), new Position(line, end)),
                     }))
                    .map((item) => ({ text: item.text, range: doucment.validateRange(item.range), }))
                    ;
                lineMatchText = matchRanges.find((item) => item.range.contains(this.currentPosition))?.text ?? lineMatchText;
            }

            const matchText = lineMatchText.match(wholeRule)?.[0];
            if (matchText) { matchTextCb(matchText); };
            return !!matchText;
        };

        for (let line = 1; line <= diffuseVal; line++) {
            const rangeText = this.getRangeTextFromProvider(line);
            const wholePassResult = rangeText.match(wholeRule)?.[0];
            const isWholePasssTest = !!wholePassResult;

            if (!isWholePasssTest) { continue; };

            const isInludeLineText = wholePassResult.includes(lineText);
            if (!isInludeLineText) { continue; };
            if (isWholePasssTest && isInludeLineText) {
                matchTextCb(wholePassResult);
                return true;
            }
        };

        return false;
    }

    getFormatText2Parse(str: string): string {
        return formatCodeText(str);
    }
};