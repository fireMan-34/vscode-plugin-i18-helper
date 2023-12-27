import { CallExpression, Node, SourceFile, SyntaxKind, } from 'ts-morph';

import { conditionReturnError, emptyReturnError, } from 'decorators/index';
import { getGlobalConfigurationSync, } from 'utils/conf';

import { createSourceFile, findStringLiteralNode, getCallExpressionFromSource, getFlatternNodes, getParen2ChildNodesIfExist } from './morph';

type TemplateDynamicVariableModal = { has: false, } | {
    /** 是否存在 */
    has: true;
    /** 调用路径到当前节点的路径 */
    CallNodeToChildNodes: Node[],
    /** 函数名 */
    callName: string;
};

const I18nWithDynamic = (str: string) => `{{${str}}}`;
const I18nId = 'id';
const I18nMsg = 'msg';
const I18nVariable = 'variable';
const I18nVaribleWithDynamic = I18nWithDynamic(I18nVariable);

class I18nTemplateModal {
    templateVariables: string[] = [];
    ast: SourceFile|null = null;

    [I18nId]: TemplateDynamicVariableModal = { has: false };
    [I18nMsg]: TemplateDynamicVariableModal = { has: false };
    [I18nVariable]: TemplateDynamicVariableModal = { has: false };

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
        return this.templateVariables;
    }
    
    /** 更新 ast 从模板中 */
    updateAstFromTemplate() {
        let waitParseTemplate = this.template;
        // 移除不符合语法的变量字符串
        if (this.templateVariables.includes(I18nVariable)) {
            waitParseTemplate = waitParseTemplate
            .replace(I18nVaribleWithDynamic,`{ variable : '${I18nVaribleWithDynamic}'}`);
        };
        this.ast = createSourceFile(waitParseTemplate);
        const callerNode = getCallExpressionFromSource(this.ast);
        const flattenNodes = getFlatternNodes(callerNode);
        
        this.updateDynamicVariableModal({
            flag: I18nId,
            flattenNodes,
            callerNode,
        });
        this.updateDynamicVariableModal({
            flag: I18nMsg,
            flattenNodes,
            callerNode,
        });
        this.updateDynamicVariableModal({
            flag: I18nVariable,
            flattenNodes,
            callerNode,
        });
    }

    /** 更新动态变量基于调用表达式节点模型 */
    updateDynamicVariableModal(options: {
        flag: typeof I18nId | typeof I18nMsg | typeof I18nVariable,
        flattenNodes: Node[],
        callerNode: CallExpression,
    }) {
        const {
            flag,
            flattenNodes,
            callerNode,
        } = options;
        const has = this.templateVariables.includes(flag);
        if (!has) {
            this[flag] = { has, };
            return;
        }
        const i18nNode = findStringLiteralNode(flattenNodes, I18nWithDynamic(flag));
        if (!i18nNode) {
            this[flag] = { has: false, };
            return;
        }
        const p2cNodes = getParen2ChildNodesIfExist(callerNode, i18nNode);
        if (!p2cNodes) {
            this[flag] = { has: false, };
            return;
        };
        // 打算提供一个数据查询逻辑，可以从调用函数节点查询到对应节点位置
        this[flag] = {
            has,
            CallNodeToChildNodes: p2cNodes,
            callName: callerNode.getExpression().getText()
        };
    }
};

/**
 * i18n 生成模板对象帮助对象
 */
export class I18nGenTemplate {
    /** 模板解析 */
    templateModals: I18nTemplateModal[] = [];

    getTemplateModals() {
        const { generateTemplate, generateTemplates } = getGlobalConfigurationSync();
        const templates = [
            generateTemplate,
            ...generateTemplates,
        ];
        this.templateModals = templates.map(template => new I18nTemplateModal(template));
        return this.templateModals;
    }
};