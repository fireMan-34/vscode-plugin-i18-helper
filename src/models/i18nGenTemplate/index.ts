import { getGlobalConfigurationSync, } from 'utils/conf';
import { emptyReturnError, conditionReturnError, } from 'decorators/index';
import { Node, Project, SyntaxKind, } from 'ts-morph';

const project = new Project({
    compilerOptions: {
        resolveJsonModule: true,
        allowJs: true,
        strict: false,
        skipDefaultLibCheck: true,
        skipLibCheck: true,
        strictNullChecks: false,
    },
});

const getSourceTempFilePath = (function(){
    let index = 1;
    return () => `${index++}.ts`;
})();

class I18nTemplateModal {
    templateVariables: string[] = [];
    /** 模板携带标记 */
    variableFlags = {
        hasI18nKey: false,
        hasI18nValue: false,
        hasI18nVariable: false,
    };

    constructor(
        /* 模板字符串 */
        public template: string,
    ) {

    }

    /**  解析存在的模板变量 */
    @emptyReturnError('代码模板检测不到任何变量')
    @conditionReturnError((result) => {
        if (!result.includes('id')) {
            return ['检测不到国际化键值变量', TypeError];
        }
    })
    getTemplateVariables() {
        const matchResult = this.template.matchAll(/{{[\S\s]*?}}/g);
        if (matchResult) {
            this.templateVariables = [ ...matchResult ].map(([,dynamicVaribale]) => dynamicVaribale);
        } else {
            this.templateVariables = [];
        }
        this.updateI18nVariables();
        return this.templateVariables;
    }

    updateI18nVariables() {
        this.variableFlags = {
            hasI18nKey: this.templateVariables.includes('id'),
            hasI18nValue: this.templateVariables.includes('msg'),
            hasI18nVariable: this.templateVariables.includes('variable'),
        };
    };
    getAstFromTemplate() {
        let waitParseTemplate = this.template;
        // 移除不符合语法的变量字符串
        if (this.variableFlags.hasI18nVariable) {
            waitParseTemplate = waitParseTemplate.replace('{{variable}}','{}');
        };
        const ast = project.createSourceFile(getSourceTempFilePath(),waitParseTemplate,);
        const callExpression = ast.getStatementByKindOrThrow(SyntaxKind.CallExpression);

        // https://ts-morph.com/navigation/compiler-nodes
        //  使用截取生成位置来生成代码，或者查询节点来生成代码
        const createSimpleAstModal = (node: Node, simpleAstModal: any = {}) => {
            simpleAstModal.kind = node.getKind();
            simpleAstModal.kindName = node.getKindName();

            if (node.isKind(SyntaxKind.CallExpression)) {
                simpleAstModal.arguments = node.getArguments().map(cnode => createSimpleAstModal(cnode,));
                simpleAstModal.expression = createSimpleAstModal(node.getExpression(),);
            }
            else if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
                simpleAstModal.properties = node.getProperties().map(createSimpleAstModal);
            } 
            else if (node.isKind(SyntaxKind.PropertyAssignment)) {
                const initializer = node.getInitializer();
                simpleAstModal.name = createSimpleAstModal(node.getNameNode());
                simpleAstModal.initialer = initializer && createSimpleAstModal(initializer);

            }
            else if (node.isKind(SyntaxKind.ArrayLiteralExpression)) {
                simpleAstModal.children = node.getElements().map(createSimpleAstModal);
            } 
            else if (node.isKind(SyntaxKind.StringLiteral)) {
                simpleAstModal.text = node.getText();
            }
            else if (node.isKind(SyntaxKind.Identifier)) {
                simpleAstModal.escapedTex = node.getText();
            } else if (node.isKind(SyntaxKind.NumericLiteral)) {
                simpleAstModal.text = node.getText();
            }
            return simpleAstModal;
        };

        const simpleAstModal = createSimpleAstModal(callExpression);
    }
};

/**
 * i18n 生成模板对象帮助对象
 */
export class I18nGenTemplate {
    /** 模板解析 */
    templateModals = [];

    getTemplateModals() {
        const { generateTemplate, generateTemplates } = getGlobalConfigurationSync();
        const templates = [
            generateTemplate,
            ...generateTemplates,
        ];
        return templates.map(template => new I18nTemplateModal(template));
    }
};