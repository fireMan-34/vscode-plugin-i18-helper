import { join } from 'path';
import { readFileSync, } from 'fs';
import { parseJsonText, } from 'typescript';

describe('学习测试 typescript API', function(){
  const jsonFilePath = join(__dirname, './type.json');
  it('测试 parseJsonText', function(){
    const result = parseJsonText(jsonFilePath, readFileSync(jsonFilePath, { encoding: 'utf-8' }));
    console.log('数据 ', result.statements[0].expression);
  });
});

