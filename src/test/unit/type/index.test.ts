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
} from "typescript";
import { expect, } from 'chai';

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
    },
  });
  const sourceFile = program.getSourceFile(typeESMPath);
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  if (!sourceFile) {
    return;
  }

  it("测试 原生 Ts 解析后给对象添加自定义属性", function () {
    const addKey = 'addKey';
    const addVal = 'addVal';
    const transformSourceFile = transform(sourceFile, [
      (context) => {
        return sourceFile => {
          function visit (node: Node) {
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
  });
});
