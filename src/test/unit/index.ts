import { equal } from 'assert';
import { describe, it, } from 'mocha';

function simpleTest (n: number) {
  return n**n;
}

describe('单元测试', function () {
  it('简单运行环境测试', function() {
    equal(simpleTest(2), 4);
  });
});

