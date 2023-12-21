import { expect } from "chai";
import {
  Project,
  SyntaxKind,
  SourceFile,
  CallExpression,
  Node,
  StringLiteral,
} from "ts-morph";

type CallerFindArgumentsAction = [
  keyof typeof SyntaxKind,
  /** 操作方法名 */ string,
  /** 直接访问|索引访问 */ "[]" | `[${number | string}]`
];

function getCallExpression(sourceFile: SourceFile) {
  return sourceFile
    .getStatementByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpressionIfKindOrThrow(SyntaxKind.CallExpression);
}

function getFunctionNameOrMethodName(caller: CallExpression): string {
  const expression = caller.getExpression();
  if (
    expression.isKind(SyntaxKind.StringLiteral) ||
    expression.isKind(SyntaxKind.Identifier) ||
    expression.isKind(SyntaxKind.PropertyAccessExpression)
  ) {
    return expression.getText();
  }
  throw new Error(`${caller.getText()} cannot be get name`);
}

function visitEachNode(node: Node, work: (node: Node) => void) {
  node.getChildren().forEach((cn) => visitEachNode(cn, work));
  work(node);
}

function visitEachNodes(nodes: Node[], work: (node: Node) => void) {
  return nodes.forEach((n) => visitEachNode(n, work));
}

function isStringLiteralValue(
  node: Node,
  value: string
): node is StringLiteral {
  return (
    node.isKind(SyntaxKind.StringLiteral) && node.getLiteralValue() === value
  );
}

function getParentsWhileKind(node: Node, kind: SyntaxKind) {
  const nodes: Node[] = [];
  let parent = node.getParent();
  if (!parent) {
    return nodes;
  }
  while (parent && parent.getKind() !== kind) {
    nodes.unshift(parent);
    parent = parent.getParent();
    if (!parent) {
      nodes.length = 0;
    }
  }
  if (nodes.length && parent) {
    nodes.unshift(parent);
  }
  return nodes;
}

function getCallerAgrumentActions(nodes: Node[]) {
  const paths: CallerFindArgumentsAction[] = [];
  try {
    for (let i = 0; i < nodes.length - 1; i++) {
      const node = nodes[i];
      const cnode = nodes[i + 1];

      if (node.isKind(SyntaxKind.CallExpression)) {
        const hasIndex = node.getArguments().findIndex((c) => c === cnode);
        if (hasIndex !== -1) {
          paths.push(["CallExpression", "getArguments", `[${hasIndex}]`]);
        }
        continue;
      }
      if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const hasIndex = node.getProperties().findIndex((p) => p === cnode);
        if (hasIndex !== -1) {
          paths.push([
            "ObjectLiteralExpression",
            "getProperties",
            `[${hasIndex}]`,
          ]);
        }
        continue;
      }
      if (node.isKind(SyntaxKind.PropertyAssignment)) {
        if (node.getNameNode() === cnode) {
          paths.push(["PropertyAssignment", "getNameNode", "[]"]);
        }
        if (node.getInitializer() === cnode) {
          paths.push(["PropertyAssignment", "getInitializer", "[]"]);
        }
        continue;
      }
    }
    return paths;
  } catch (err) {
    throw err;
  }
}

function getNodeFromCallerArgument(node: Node, action: CallerFindArgumentsAction): Node {
  const [ kind, methodName, idxFlag ] = action;

  if (!node.isKind(SyntaxKind[kind])) {
    throw new Error('类型匹配错误');
  }

  // @ts-ignore
  const result = node[methodName]();
  if (idxFlag === '[]') {
    return result;
  }
  const inferIndex = idxFlag.slice(1,-1);
  return result[inferIndex];
};
function getNodeFromCallerArguments(node: Node, actions: CallerFindArgumentsAction[]): Node {
  return actions.reduce((node, action) => getNodeFromCallerArgument(node, action), node);
};


describe("测试 ts-morph", function () {
  it("测试简单解析性能", function () {
    const p = new Project();
    const sf = p.createSourceFile(
      "temp",
      `formatMessage({
        id: '\${id}',
        message: '\${msg}',
      })`
    );
    const caller = getCallExpression(sf);
    const callerName = getFunctionNameOrMethodName(caller);
    const o = {
      callerName,
      i18nId: <CallerFindArgumentsAction[]>[],
      i18nMsg: <CallerFindArgumentsAction[]>[],
    };
    visitEachNodes(caller.getArguments(), (n) => {
      if (isStringLiteralValue(n, "${id}")) {
        const parentNodes = getParentsWhileKind(n, SyntaxKind.CallExpression);
        const nodes = parentNodes.concat(n);
        const actions = getCallerAgrumentActions(nodes);
        o.i18nId = actions;
        expect(n).is.equal(getNodeFromCallerArguments(nodes[0], actions));
      }
      if (isStringLiteralValue(n, "${msg}")) {
        const parentNodes = getParentsWhileKind(n, SyntaxKind.CallExpression);
        const nodes = parentNodes.concat(n);
        const actions = getCallerAgrumentActions(nodes);
        o.i18nMsg = actions;
      }
    });
    expect(o.callerName).is.string;
    expect(o.i18nId.length).gt(0);
    expect(o.i18nMsg.length).gt(0);
  });
});
