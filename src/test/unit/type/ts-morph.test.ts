 import { expect } from "chai";
import {
  CallExpression,
  Node,
  Project,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from "ts-morph";

import {
  findStringLiteralNode,
  getCallExpressionFromSource,
  getFlatternNodes,
  getParen2ChildNodesIfExist,
  getParentAndChildSimplePath,
} from 'models/i18nGenTemplate/morph';

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
        id: '\{{id}}',
        message: '\{{msg}}',
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
      if (isStringLiteralValue(n, "{{id}}")) {
        const parentNodes = getParentsWhileKind(n, SyntaxKind.CallExpression);
        const nodes = parentNodes.concat(n);
        const actions = getCallerAgrumentActions(nodes);
        o.i18nId = actions;
        expect(n).is.equal(getNodeFromCallerArguments(nodes[0], actions));
      }
      if (isStringLiteralValue(n, "{{msg}}")) {
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

  it('工具库测试', function(){
    const p = new Project();
    const ast = p.createSourceFile('temp.ts', `intl.formatMessage({id: '{{id}}', defaultMessage: '{{msg}}'},)`);
    const caller = getCallExpressionFromSource(ast);
    const nodes = getFlatternNodes(caller);
    const i18nIdNode = findStringLiteralNode(nodes, '{{id}}');
    // https://www.saoniuhuo.com/question/detail-2253664.html
    // https://github.com/dsherret/ts-morph/issues/107
    // 疑似有个小 bug 当前元素的父元素类型为确定则无法返回，可能我误会了它的用法
    // console.log('能否取到函数', i18nIdNode?.getParentWhile(node => {
    //   console.log('node', node.getKindName())
    //   if (node.isKind(SyntaxKind.CallExpression)) {
    //     return false;
    //   } else {
    //     return true;
    //   }
    // })?.getParent());
    if (!i18nIdNode) {
      return;
    };
    const p2cNs = getParen2ChildNodesIfExist(caller, i18nIdNode);
    if (!p2cNs) {
      return;
    };
    for (let i = 0; i < p2cNs.length - 1; i++) {
      const p = p2cNs[i], c = p2cNs[i + 1];
      // console.log('路径', getParentAndChildSimplePath(p, c));
    }
  });

  it('生成测试', function(){
    const p = new Project();
    const sf = p.createSourceFile(
      "temp",
      `formatMessage({
        id: '{{id}}',
        message: '{{msg}}',
      })`
    );


     const newSF= sf.forEachDescendant((node, traversal) => {
      return node;
    });
    // 修改通个属性
    // https://blog.kaleidos.net/Refactoring-Typescript-code-with-ts-morph/
    newSF?.getDescendants().forEach((node) => {
      if (Node.isStringLiteral(node)) {
        switch (node.getLiteralValue()) {
          case '{{id}}':
            return node.setLiteralValue('自定义ID');
        }
      }
    });
  }, );
});
