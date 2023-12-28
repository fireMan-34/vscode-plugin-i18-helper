import { Node, Project, SourceFile, SyntaxKind, PropertyName } from 'ts-morph';
import findLastIndex from 'lodash/findLastIndex';
import { TextDocument } from 'vscode';

// https://ts-ast-viewer.com/

export const singleProject = new Project({
    compilerOptions: {
        resolveJsonModule: true,
        allowJs: true,
        strict: false,
        skipDefaultLibCheck: true,
        skipLibCheck: true,
        strictNullChecks: false,
    },
});

export const createSourceFile = (() => {
    let index = 0;
    return (code: string) => singleProject.createSourceFile(
        `${index++}.ts`,
        code,
    );
})();

/** 文件名和内容生成 ast 并缓存，目前仅用字符串长度作为失效校验 */
export const createSourceFileCache = (function () {
    const map = new Map<string, [number, SourceFile, Node[]]>();
    return (filePath: string, code: string) => {
        if (!map.has(filePath) || map.get(filePath)![0] !== code.length) {
            const ast = singleProject.createSourceFile(filePath, code, { overwrite: true });
            const nodes = getFlatternNodes(ast);
            map.set(filePath, [code.length, ast, nodes]);
        }
        const [, ast, nodes] = map.get(filePath)!;
        return [ast, nodes,] as const;
    };
})();

/** 从文档生成代码 ast */
export const createSourceFileFromDocument = (document: TextDocument) => {
    const filePath = document.uri.fsPath;
    const code = document.getText();
    return createSourceFileCache(filePath, code);
};

/** 查找字符串模板变量位置 */
export const findStringLiteralNode = (nodes: Node[], text: string) => {
    return nodes.find(n => n.isKind(SyntaxKind.StringLiteral) && n.getLiteralText() === text);
};

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
    const nodes = [node];
    if (children.length) {
        return nodes.concat(...children.flatMap(getFlatternNodes));
    };
    return nodes;
};

/** 获取所有祖先节点 */
export const getParents = (node: Node) => {
    const parents = [];
    let parent = node.getParent();
    while (parent) {
        parents.unshift(parent);
        parent = parent.getParent();
    };
    return parents;
};

/** 获取存在对应类型最近的父路径 */
export const getParentsIfKindExist = (node: Node, kind: SyntaxKind) => {
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

/** 获取对应类型元素的父类型 */
export const getWhileKindIfExists = <K extends SyntaxKind>(kind: K, node: Node) => {
    if (node.getParent()?.isKind(kind)) {
        return node.getParent()?.asKind(kind);
    }
    return node.getParentWhile(n => {
        if (n.isKind(kind)) {
            return false;
        }
        return true;
    })?.getParent()?.asKind(kind);
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

export const getPropertyName = (node: PropertyName): string => {
    if (node.isKind(SyntaxKind.StringLiteral) || node.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return node.getLiteralText();
    } else if (
        node.isKind(SyntaxKind.Identifier) ||
        node.isKind(SyntaxKind.NumericLiteral) ||
        node.isKind(SyntaxKind.ComputedPropertyName) ||
        node.isKind(SyntaxKind.PrivateIdentifier)
    ) {
        return node.getText();
    } else {
        return '';
    }
};

/** 简单生成节点路径语法
 * 测试中……
 */
export const getParentAndChildSimplePath = (parent: Node, child: Node): Node2NodePathSimpleModal => {
    const common = {
        kind: parent.getKind(),
        kindName: parent.getKindName(),
    };
    if (parent.isKind(SyntaxKind.CallExpression)) {
        return {
            ...common,
            index: parent.getArguments().findIndex(argN => argN === child),
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

    return {
        ...common,
        index: void 0,
    };
};


/** 生成节点路径 */
export const genSimplePathFromNodes = (nodes: Node[]) => {
    const node2nodes = nodes.slice(0, -1).map((p, i) => [p, nodes[i + 1]]);
    return node2nodes.map(([p, c]) => getParentAndChildSimplePath(p, c));
};


/** 使用生成路径进行访问 */
export const useSimpePathFromNode = (node: Node, simplePaths: Node2NodePathSimpleModal[]): Node | void => {
    try {
        const paths = [...simplePaths];
        let mapNode = node;
        while (paths.length) {
            const path = paths.shift();
            if (!path) {
                return mapNode;
            };
            if (mapNode.getKind() !== path.kind) {
                return void 0;
            }
            if (mapNode.isKind(SyntaxKind.CallExpression) && typeof path.index === "number") {
                mapNode = mapNode.getArguments()[path.index];
            } else if (mapNode.isKind(SyntaxKind.ArrayLiteralExpression) && typeof path.index === "number") {
                mapNode = mapNode.getElements()[path.index];
            } else if (mapNode.isKind(SyntaxKind.ObjectLiteralExpression) && typeof path.index === "string") {
                mapNode = mapNode.getPropertyOrThrow(path.index);
            } else if (mapNode.isKind(SyntaxKind.PropertyAssignment)) {
                mapNode = mapNode.getInitializerOrThrow();
            } else {
                throw new Error("Unknown Node");
            }
        };
        return mapNode;
    } catch (error) {
        console.error('unknown error node', node);
        return void 0;
    }
};