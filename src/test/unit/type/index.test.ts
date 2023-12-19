import { join } from "path";
import {
  Node,
  SourceFile,
  createPrinter,
  createProgram,
  isObjectLiteralExpression,
  transform,
  visitEachChild,
  visitNode,
  NewLineKind,
  createSourceFile,
  ScriptTarget,
  isPropertyAssignment,
  isIdentifier,
  isStringLiteral,
} from "typescript";
import { expect, } from 'chai';
import typeJson from './type.json';
import { SyntaxKind } from "ts-morph";

declare namespace ts {
  interface StringLiteral {
    /** 补充缺失代码类型 */
    text: string;
  }
}

/**
 * @see https://blog.csdn.net/hhhhhhhhhhhhhhhc/article/details/131450984 simple blog tell me typescript
 * @see https://zhuanlan.zhihu.com/p/630871173
 * @see https://stackoverflow.com/questions/45466913/how-can-i-parse-modify-and-regenerate-the-ast-of-a-typescript-file-like-jscod
 * @see https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 * @see https://github.com/microsoft/TypeScript/pull/13940
 *
 * @description 节点修改提供的方法是不可变
 */
describe("学习测试 typescript API", function () {
  const typeESMPath = join(__dirname, "./type.esm.ts");
  const program = createProgram({
    rootNames: [typeESMPath],
    options: {
      rootDir: typeESMPath,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      resolveJsonModule: true,
    },
  });
  const sourceTSFile = program.getSourceFile(typeESMPath);
  const sourceJsonFile = createSourceFile('type.json', JSON.stringify(typeJson), ScriptTarget.JSON,);
  const addKey = 'addKey';
  const addVal = 'addVal';
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  if (!sourceTSFile) {
    return;
  }

  it("测试 原生 Ts 解析后给对象添加自定义属性", function () {
    const transformSourceFile = transform(sourceTSFile, [
      (context) => {
        return sourceFile => {
          function visit(node: Node) {
            node = visitEachChild(node, visit, context);

            if (isObjectLiteralExpression(node)) {
              return context.factory.updateObjectLiteralExpression(
                node,
                node.properties.concat(
                  context.factory.createPropertyAssignment(
                    addKey,
                    context.factory.createStringLiteral(
                      addVal,
                    )
                  )
                )
              );
            }

            return node;
          }
          return visitNode(sourceFile, visit) as SourceFile;// 不知道为啥官方的的这个搭配不太智能。
        };
      },
    ]);
    const outFile = printer.printFile(transformSourceFile.transformed[0]);
    expect(outFile, '输出结果不为空').is.not.null;
    expect(outFile, '包含生成代码文本').has.string(addKey);
    expect(outFile, '包含生成代码文本').has.string(addVal);
    transformSourceFile.dispose();
  });

  if (!sourceJsonFile) {
    return;
  }
  const modifyKey = '$schema';
  it('测试 json 格式解析和修改', function () {
    const transformResult = transform(sourceJsonFile, [
      (context) => {
        return (sourceFile) => {
          function visit(node: Node) {
            node = visitEachChild(node, visit, context);
            if (isPropertyAssignment(node)
              && (isIdentifier(node.name) || isStringLiteral(node.name))&& node.name.text === modifyKey
              && isObjectLiteralExpression(node.initializer)
            ) {
              return context.factory.updatePropertyAssignment(
                node, 
                node.name, 
                context.factory.updateObjectLiteralExpression(
                  node.initializer, 
                  node.initializer.properties.concat(
                    context.factory.createPropertyAssignment(
                      addKey, 
                      context.factory.createStringLiteral(addVal)
                      )
                    )
                )
              );
            }
            return node;
          }
          return visitNode(sourceFile, visit) as SourceFile;
        };
      }
    ]);
    const outFile = printer.printFile(transformResult.transformed[0]);
    // 无法直接生成 json 格式只能用这种方式取巧
    const json = eval(outFile);
    expect(json).ownProperty(modifyKey).has.property(addKey).is.string(addVal);
    transformResult.dispose();
    });

  it('测试某个 json 属性新增在某个属性位置前面', function (){
    const transformResult = transform(
      sourceJsonFile,
      [
        (context) => {
          const visit = (node: Node) => {
            node = visitEachChild(node, visit, context);
            const { factory, } = context; 
            if (isObjectLiteralExpression(node)) {
              const hasFindIndex = node.properties.findIndex(p => p.name && isStringLiteral(p.name) && p.name.text === modifyKey );
              if (hasFindIndex > -1) {
                return factory.updateObjectLiteralExpression(
                  node,
                  factory.createNodeArray(
                    node.properties.slice(0, hasFindIndex)
                    .concat(factory.createPropertyAssignment(
                      addKey,
                      factory.createStringLiteral(addVal),
                    ))
                    .concat(node.properties.slice(hasFindIndex)),
                  ),
                );
              }
            }
            return node;
          };
          return (sourceFile) => {
            return visitNode(sourceFile, visit) as SourceFile;
          };
        }
      ],
    );
    const [nextSourceFile]  = transformResult.transformed;

    const testVisit  = (cn: Node) => {
      cn.forEachChild(testVisit);
      if (!isObjectLiteralExpression(cn)) {
        return;
      }
      const modifyIndex = cn.properties.findIndex(p => 
        p.name
        && isStringLiteral(p.name)
        && p.name.text === modifyKey
      );
      if (modifyIndex <= -1) {
        return;
      }
      const addKeyIndex = cn.properties.findIndex(p =>
        p.name
        // 记住 如果没有构造实例的 name 默认是标识符的形式
        && (isStringLiteral(p.name) || isIdentifier(p.name))
        && p.name.text === addKey
      );
      expect(addKeyIndex).gt(-1);
      expect(addKeyIndex).lt(modifyIndex);
    };

    nextSourceFile.forEachChild(testVisit);
  });
});
