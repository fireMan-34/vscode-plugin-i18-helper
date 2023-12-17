import { readFileSync } from 'fs';
import { join } from 'path';
import { LanguageServiceMode, ScriptTarget, createScanner, SyntaxKind, LanguageVariant, } from 'typescript';

function mapFilter<T, N = T>(arr: T[], fn: (val: T, idx: number, arr: T[]) => T | T[] | N | N[] | void) {
  const filterArr = [];
  for (let i = 0; i < arr.length; i++) {
    const r = fn(arr[i], i, arr);
    if (!r) {
      continue;
    }
    if (Array.isArray(r) && !Array.isArray(arr[i])) {
      filterArr.push(...r);
    } else {
      filterArr.push(r);
    }
  }
  return filterArr;
};

/** 
 * @see https://blog.csdn.net/hhhhhhhhhhhhhhhc/article/details/131450984 simple blog tell me typescript
*/
describe('学习测试 typescript API', function () {
  const jsonFilePath = join(__dirname, './type.json');
  it('测试 typescript 解析 json 数据格式', function () {
    const jsonText = readFileSync(jsonFilePath, 'utf-8');
    const scanner = createScanner(ScriptTarget.ES5, true, LanguageServiceMode.Semantic as any, jsonText);
    const list = [];
    while (scanner.scan() !== SyntaxKind.EndOfFileToken) {
      list.push({
        token: scanner.getToken(),
        tokenType: SyntaxKind[scanner.getToken()],
        text: scanner.getTokenText(),
        val: scanner.getTokenValue(),
      });
    };
    const mp = mapFilter(list, (item, index, arr) => {
      if (
        item.token === SyntaxKind.ColonToken
        && arr[index - 1].token === SyntaxKind.StringLiteral
        && arr[index + 1].token === SyntaxKind.StringLiteral
      ) {
        return {
          key: arr[index - 1].val,
          val: arr[index + 1].val,
        };
      }
    });
  });

  const tsPath = join(__dirname, './type.esm.ts');
  it('测试 typescript 解析 ts 文件格式', function (){
    const tsText = readFileSync(tsPath, 'utf8');
    const scanner = createScanner(ScriptTarget.ES5, true, LanguageVariant.Standard, tsText);
    
    while (scanner.scan() !== SyntaxKind.EndOfFileToken) {
      const result = {
        token: scanner.getToken(),
        tokenType: SyntaxKind[scanner.getToken()],
        text: scanner.getTokenText(),
        val: scanner.getTokenValue(),
        start: scanner.getTokenStart(),
        end: scanner.getTokenEnd(),
        /** 包含做空格开始 */
        fullStart: scanner.getTokenFullStart(),
      };
    };
  });
});

