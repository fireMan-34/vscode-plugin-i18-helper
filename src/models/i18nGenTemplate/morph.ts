import { Node, Project, SourceFile, SyntaxKind, PropertyName, } from 'ts-morph';
import findLastIndex from 'lodash/findLastIndex';

// https://ts-ast-viewer.com/

const getSourceTempFilePath = (function(){
    let index = 1;
    return () => `${index++}.ts`;
})();

export const project = new Project({
    compilerOptions: {
        resolveJsonModule: true,
        allowJs: true,
        strict: false,
        skipDefaultLibCheck: true,
        skipLibCheck: true,
        strictNullChecks: false,
    },
});

export const createSourceFile = (code: string) => project.createSourceFile(
    getSourceTempFilePath(),
    code,
);

/** 
 * https://ts-morph.com/navigation/compiler-nodes
 * 使用截取生成位置来生成代码，或者查询节点来生成代码
 */
export const getCallExpressionFromSource = (source: SourceFile) => {
    return source
    .getStatementByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpressionIfKindOrThrow(SyntaxKind.CallExpression);
};

/** 获取扁平节点 */
export const getFlatternNodes = (node: Node): Node[] => {
    const children = node.getChildren();
    const nodes = [ node ];
    if (children.length) {
        return nodes.concat(...children.flatMap(getFlatternNodes));
    };
    return nodes;
};

/** 获取所有祖先节点 */
export const getParents = (node: Node) => {
    const parents = [ ];
    let parent = node.getParent();
    while (parent) {
        parents.unshift(parent);
        parent = parent.getParent();
    };
    return parents;
};

/** 获取存在对应类型最近的父路径 */
export const getParentsIfKindExist = (node: Node, kind: SyntaxKind ) => {
    const parents = getParents(node);
    const startIndex = findLastIndex(parents, p => p.isKind(kind));
    if (startIndex > -1) {
        return parents.slice(startIndex);
    }
};

/** 获取祖父元素到子元素存在的节点 */
export const getParen2ChildNodesIfExist = (parent: Node, child: Node) => {
    const parents = getParents(child);
    const startIndex = findLastIndex(parents, p => p === parent);
    if (startIndex > -1) {
        return parents.slice(startIndex).concat(child);
    }
};

/** 获取祖父元素到子元素存在的索引路径 */
export const getParent2ChildrenIndexPathIfExist = (parent: Node, child: Node) => {
    const parents = getParents(child);
    const startIndex = findLastIndex(parents, p => p === parent);
    if (startIndex > -1) {
        const childs = parents.slice(startIndex + 1).concat(child);
        return childs.map(c => c.getChildIndex());
    }
};

export interface Node2NodePathSimpleModal {
    kind: SyntaxKind;
    kindName: string,
    /**
     * void 直接访问
     * number 数字索引访问
     * string 属性访问
     */
    index: void | number | string;
};

export const getPropertyName = (node: PropertyName) : string => {
    if (node.isKind(SyntaxKind.StringLiteral) || node.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return node.getLiteralText();
    } else if (
        node.isKind(SyntaxKind.Identifier) ||
        node.isKind(SyntaxKind.NumericLiteral) || 
        node.isKind(SyntaxKind.ComputedPropertyName) ||
        node.isKind(SyntaxKind.PrivateIdentifier)
    ) {
        return node.getText();
    }  else {
        return '';
    }
};

export const getParentAndChildSimplePath = (parent: Node, child: Node): Node2NodePathSimpleModal | void => {
    const common = {
        kind: parent.getKind(),
        kindName: parent.getKindName(),
    };
    if (parent.isKind(SyntaxKind.CallExpression)) {
        return {
            ...common,
            index: parent.getArguments().findIndex(argN => argN  === child),
        };
    }
    if (parent.isKind(SyntaxKind.ObjectLiteralExpression) && child.isKind(SyntaxKind.PropertyAssignment)) {
        return {
            ...common,
            index: getPropertyName(child.getNameNode()),
        };
    }
    if (parent.isKind(SyntaxKind.ArrayLiteralExpression)) {
        return {
            ...common,
            index: parent.getElements().findIndex(cN => cN === child),
        };
    }

    if (parent.isKind(SyntaxKind.PropertyAssignment)) {
        return {
            ...common,
            index: void 0,
        };
    }
};

/** 查找字符串模板变量位置 */
export const findStringLiteralNode = (nodes: Node[], text: string) => {
    return nodes.find(n => n.isKind(SyntaxKind.StringLiteral) && n.getLiteralText() === text);
};