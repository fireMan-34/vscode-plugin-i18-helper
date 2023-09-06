import { Position, TextDocument } from "vscode";
import { FORMAT_MESSAGE_ID_REGEX } from 'utils/code';
import { I18nTextParse, I18nTextParsePlugin } from "types/index";

class BaseI18nTextParsePllugin implements I18nTextParsePlugin {
    context: I18nTextParse;
    generateTemplate: string = "formatMessage({\nid: ${id},\nmsg: ${msg},\n})";
    matchValue: string | undefined | null;

    constructor(host: I18nTextParse) {
        this.context = host;
    }
    get isThisPlugin(): boolean {
        const lineText = this.context.getLineText();
        this.matchValue = lineText.match(FORMAT_MESSAGE_ID_REGEX)?.[1];
        return !!this.matchValue;
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

    getRangeTextFromProvider(): string {
        return '';
    }

    getLineText(): string {
        const { document, currentPosition } = this;
        const line = document.lineAt(currentPosition);
        return line.text;
    }
};