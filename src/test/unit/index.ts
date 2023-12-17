import { equal } from 'assert';
import Mocha, { describe, it, } from 'mocha';
import { glob } from 'glob';
import { argv, } from 'process';
import { isSameTrimString } from 'utils/str';
import { isSamePath } from 'utils/path';
import { join } from 'path';

function simpleTest (n: number) {
  return n**n;
}

describe('单元测试', function () {
  it('简单运行环境测试', function() {
    equal(simpleTest(2), 4);
  });

  it('测试是否能够正常识别别名路径', function(){
    equal(isSameTrimString(__dirname, __dirname), true);
  });

  it('测试是否能够只导入 vscode 类型包进行工作', function(){
    equal(isSamePath(__dirname, __dirname), true);
  });
});

const root = join(__dirname, '..');

async function main() {
  const [ ignore ] = argv.slice(3);
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 3400,
  });

  await new Promise((resolve, reject) => {
    glob('unit/**/**.test.ts', { cwd: root, ignore: ignore, }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      files.map(file => join(root, file))
      .forEach(path => mocha.addFile(path));

      mocha.run((fails) => {
        if (fails) {
          reject(fails);
        } else {
          resolve(files);
        }
      });
    });
  });

};

main();