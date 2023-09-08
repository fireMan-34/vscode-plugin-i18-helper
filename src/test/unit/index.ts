import { equal } from 'assert';
import { describe, it, } from 'mocha';
import { isSameTrimString } from 'utils/str';

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
});

