import { HoverProvider, Hover, languages, MarkdownString, TextDocument, Position, Range } from 'vscode';
import { I18nGenTemplate, } from 'models/i18nGenTemplate';
import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/provider';

const getStatementCallIfExist = (document: TextDocument, position: Position) => {
    if (document.lineAt(position.line).isEmptyOrWhitespace) {
        return;
    }

    const cursorOffset = document.offsetAt(position);
    const documentText = document.getText();
    const maxOffset = documentText.length;
    let lp = cursorOffset, rp = cursorOffset;

    while (lp > 0 && ![ ')', ';',  ].includes(documentText[lp - 1])) {
        lp -= 1;
    }
    while (rp < maxOffset && ![ ')' ].includes(documentText[rp - 1])) {
        rp += 1;
    };

    return document.getText(
        new Range(
            document.positionAt(lp),
            document.positionAt(rp),
        ),
    );
}; 

const hoverProvider: HoverProvider = {
    async provideHover(document, position, token) {
        try {
            const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
            
            const simpleText = getStatementCallIfExist(document, position);
            if (!simpleText) {
                return;
            }

            const result = await i18nGenTemplate.getI18nIdFromDocumentPosition(document,position);
            const mayMsgResult = await i18nGenTemplate.getI18nMsgFromDocumentPosition(document, position);
            const mayVaribleResult = await i18nGenTemplate.getI18nVariableFromDocumentPosition(document, position);
            if (result) {
                return new Hover(new MarkdownString(`测试结果 ========> 
                  id: ${result}
                  msg: ${mayMsgResult ?? 'null'}
                  variable: ${mayVaribleResult && mayVaribleResult.join(',')}
                `));
            }
        } catch (error) {
            console.error(error);
        }
    },
};

export default function createAstHoverProvider(){
    return languages.registerHoverProvider(SUPPORT_DOCUMENT_SELECTOR, hoverProvider);
}