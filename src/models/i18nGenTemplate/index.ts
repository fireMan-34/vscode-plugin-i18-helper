import type { TextDocument, Position } from 'vscode';
import { CallExpression, Node, SourceFile, SyntaxKind, } from 'ts-morph';
import inRange from 'lodash/inRange';

import { conditionReturnError, emptyReturnError, } from 'decorators/index';
import { getGlobalConfigurationSync, } from 'utils/conf';

import {
    Node2NodePathSimpleModal,
    createSourceFile,
    findStringLiteralNode,
    getCallExpressionFromSource,
    getFlatternNodes,
    getParen2ChildNodesIfExist,
    genSimplePathFromNodes,
    getWhileKindIfExists,
    createSourceFileFromDocument,
    useSimpePathFromNode,
    getPropertyName,
} from './morph';

interface FailTemplateDynamicVariableModal { has: false, };
interface SuccessTemplateDynamicVariableModal {
    /** 是否存在 */
    has: true;
    /** 调用路径到当前节点的路径 */
    CallNodeToChildNodes: Node[],
    /** 函数/方法名 */
    callName: string;
    /** 参数位置 */
    agrumentIndex: string | number | void;
    /** 节点路径 */
    node2nodePath: Node2NodePathSimpleModal[],
}

type TemplateDynamicVariableModal = FailTemplateDynamicVariableModal | SuccessTemplateDynamicVariableModal;

interface CodeTextModal {
    codeTextAst: SourceFile,
    codeTextCaller: CallExpression,
    codeTextCallerName: string,
}

type VariableFlag = typeof I18nId | typeof I18nMsg | typeof I18nVariable;

const I18nWithDynamic = (str: string) => `{{${str}}}`;
const I18nId = 'id';
const I18nMsg = 'msg';
const I18nVariable = 'variable';
const I18nVaribleWithDynamic = I18nWithDynamic(I18nVariable);

const isSuccessFlag = (t: TemplateDynamicVariableModal): t is SuccessTemplateDynamicVariableModal => t.has;
const isFailFlag = (t: TemplateDynamicVariableModal): t is FailTemplateDynamicVariableModal => !t.has;

class I18nTemplateModal {
    templateVariables: string[] = [];
    ast: SourceFile | null = null;

    [I18nId]: TemplateDynamicVariableModal = { has: false };
    [I18nMsg]: TemplateDynamicVariableModal = { has: false };
    [I18nVariable]: TemplateDynamicVariableModal = { has: false };

    constructor(
        /* 模板字符串 */
        public template: string,
    ) {
        this.update();
    }

    update() {
        this.updateTemplateVariables();
        this.updateAstFromTemplate();
    }

    /**  解析存在的模板变量 */
    @emptyReturnError('代码模板检测不到任何变量')
    @conditionReturnError((result) => {
        if (!result.includes(I18nId)) {
            return ['检测不到国际化键值变量', TypeError];
        }
    })
    updateTemplateVariables() {
        const matchResult = this.template.matchAll(/{{([\S\s]*?)}}/g);
        if (matchResult) {
            this.templateVariables = [...matchResult].map(([, dynamicVaribale]) => dynamicVaribale);
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
                .replace(I18nVaribleWithDynamic, `{ variable : '${I18nVaribleWithDynamic}'}`);
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
        flag: VariableFlag,
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
        if (flag === I18nVariable) {
            const objectLiteralIndex = p2cNodes.findIndex(i => i.isKind(SyntaxKind.ObjectLiteralExpression));
            p2cNodes.splice(objectLiteralIndex + 1);
        }
        const node2NodePath = genSimplePathFromNodes(p2cNodes);
        const [callPath] = node2NodePath;
        // 打算提供一个数据查询逻辑，可以从调用函数节点查询到对应节点位置
        this[flag] = {
            has,
            CallNodeToChildNodes: p2cNodes,
            callName: callerNode.getExpression().getText(),
            agrumentIndex: callPath.index,
            node2nodePath: node2NodePath,
        };
    }

    /** 判定是否存在相似语法结构
     * 动态国际化变量标记会跳过属性检测，判定是否是字面量类型
     */
    isSameSyntax(flag: VariableFlag, codeTextModal: CodeTextModal): boolean {
        if (!this[I18nId].has) {
            return false;
        }
        const modal = this[flag];
        if (isSuccessFlag(modal)) {
            if (codeTextModal.codeTextCallerName !== modal.callName) {
                return false;
            }

            const node2NodePath = flag === I18nVariable
                // 仅检测是否符合参数位置和是否是字面量对象
                ? modal.node2nodePath.slice(0, 1)
                : modal.node2nodePath;
            const node = useSimpePathFromNode(codeTextModal.codeTextCaller, node2NodePath);
            if (!node) {
                return false;
            }
            if (flag === I18nVariable) {
                return node.isKind(SyntaxKind.ObjectLiteralExpression);
            } else {
                return node.isKind(SyntaxKind.StringLiteral);
            }
        }
        return false;
    }

    /** 提取代码对应位置的国际化key字面量 */
    matchIdStringLitera(codeTextModal: CodeTextModal) {
        if (!this[I18nId].has) {
            return;
        }
        if (!this.isSameSyntax(I18nId, codeTextModal)) {
            return;
        }
        const node = useSimpePathFromNode(codeTextModal.codeTextCaller, this[I18nId].node2nodePath);
        if (!node) {
            return;
        }
        return node.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
    }

    /** 提取代码对应位置的国际化默认文本字面量 */
    matchMsgStringLitera(codeTextModal: CodeTextModal) {
        if (!this[I18nMsg].has) {
            return;
        }
        if (!this.isSameSyntax(I18nId, codeTextModal)) {
            return;
        }
        const node = useSimpePathFromNode(codeTextModal.codeTextCaller, this[I18nMsg].node2nodePath);
        if (!node) {
            return;
        }
        return node.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
    }

    /** 提取已经输出的国际化键值 */
    matchMsgVariableLitera(codeTextModal: CodeTextModal) {
        if (!this[I18nVariable].has) {
            return;
        }
        if (!this.isSameSyntax(I18nId, codeTextModal)) {
            return;
        }
        const node = useSimpePathFromNode(codeTextModal.codeTextCaller, this[I18nVariable].node2nodePath);
        if (!node) {
            return;
        }
        return node.asKind(SyntaxKind.ObjectLiteralExpression)?.getProperties().filter(p => p.isKind(SyntaxKind.PropertyAssignment) || p.isKind(SyntaxKind.ShorthandPropertyAssignment)).map(p => {
            if (p.isKind(SyntaxKind.PropertyAssignment)) {
                return p.getName();
            } 
            else if (p.isKind(SyntaxKind.ShorthandPropertyAssignment)) {
                return p.getName();
            }
            return '';
        });
    }
};

/**
 * i18n 生成模板对象帮助对象
 */
export class I18nGenTemplate {
    static templateModalsCacheMap = new Map<string, I18nTemplateModal>();

    /** 模板解析 */
    templateModals: I18nTemplateModal[] = [];

    /** 缓存已存在模板对象 */
    refreshTemplateModals() {
        const { generateTemplate, generateTemplates } = getGlobalConfigurationSync();
        const templates = [
            generateTemplate,
            ...generateTemplates,
        ];
        this.templateModals = templates.map(template => {
            const map = I18nGenTemplate.templateModalsCacheMap;
            if (!map.has(template)) {
                map.set(template, new I18nTemplateModal(template));
            };
            return map.get(template)!;
        });
        return this;
    }

    getTemplateWithFlags(flags: VariableFlag[]) {
        return this.templateModals.filter(modal =>
            flags.every((flag) => modal.templateVariables.includes(flag))
            && modal[I18nId].has
        );
    };

    /** 代码转消费模型 */
    codeTextToModal(sourceText: string): CodeTextModal | void {
        try {
            const ast = createSourceFile(sourceText);
            const caller = getCallExpressionFromSource(ast);

            return {
                codeTextAst: ast,
                codeTextCaller: caller,
                codeTextCallerName: caller.getExpression().getText(),
            };
        } catch (error) {
            return;
        }
    }

    /** 文档代码转代码 */
    documentPostionToModal(
        document: TextDocument,
        position: Position,
    ): CodeTextModal | void {
        const [ast, flattenNodes] = createSourceFileFromDocument(document);
        const offset = document.offsetAt(position);
        const nodes = flattenNodes.filter(n => inRange(offset, n.compilerNode.pos, n.compilerNode.end));
        const node = nodes.reduce((res, cur) => {
            const space = res.compilerNode.pos - res.compilerNode.end;
            const curSpace = cur.compilerNode.pos - cur.compilerNode.end;
            return space - curSpace ? cur : res;
        });
        if (!node) {
            return;
        }
        const caller = getWhileKindIfExists(SyntaxKind.CallExpression, node);
        if (!caller) {
            return;
        };

        return {
            codeTextAst: ast,
            codeTextCaller: caller,
            codeTextCallerName: caller.getExpression().getText(),
        };
    }

    /**
     * 由于作者水平有限无法找到解决随机位置读取语句的办法，所以打算暂时搁置这个函数
     * 打算搞个匹配部分 左边匹配到 ;)  结束, 匹配到 ( 则匹配到有意义字符到第一个空白
     * 右边匹配规则则是匹配到第一个是 ) 则就结束，匹配到 （ 也就是第一个 )  结束
     * @param sourceText 源代码语句
     * @returns 
     */
    getCodeTextI18nId(sourceText: string): string | void {
        const templates = this.getTemplateWithFlags([I18nId]);
        const codeTextModal = this.codeTextToModal(sourceText);
        if (!codeTextModal) {
            return;
        }
        for (const template of templates) {
            const result = template.matchIdStringLitera(codeTextModal);
            if (result) {
                return result;
            }
        }
    }

    /** 从文档中优化
     * 目前可以正常识别，但是存在一个问题，每一次访问都需要重新生成 ast ，这毫无疑问是非常昂贵的。
     */
    getI18nIdFromDocumentPosition(document: TextDocument, position: Position): string | void {
        const templates = this.getTemplateWithFlags([I18nId]);
        const docPosModal = this.documentPostionToModal(document, position);
        if (!docPosModal) {
            return;
        }
        for (const template of templates) {
            const result = template.matchIdStringLitera(docPosModal);
            if (result) {
                return result;
            }
        }
    }

    getI18nMsgFromDocumentPosition(document: TextDocument, position: Position): string | void {
        const templates = this.getTemplateWithFlags([I18nId, I18nMsg]);
        const docPosModal = this.documentPostionToModal(document, position);
        if (!docPosModal) {
            return;
        }
        for (const template of templates) {
            const result = template.matchMsgStringLitera(docPosModal);
            if (result) {
                return result;
            }
        }
    }

    getI18nVariableFromDocumentPosition(document: TextDocument, position: Position): string[] | void {
        const templates = this.getTemplateWithFlags([I18nId, I18nVariable]);
        const docPosModal = this.documentPostionToModal(document, position);
        if (!docPosModal) {
            return;
        }
        for (const template of templates) {
            const result = template.matchMsgVariableLitera(docPosModal);
            if (result) {
                return result;
            }
        }
    }

    /** 匹配国际化翻译中的变量并输出 */
    matchMsgVariable(i18nMsg: string): string[] | void {
        const reg = /{{([\S\s]*?])}}/g;
        const result = i18nMsg.matchAll(reg);
        if (!result) {
            return;
        }
        return Array.from(result).map(([, v]) => v);
    }
};