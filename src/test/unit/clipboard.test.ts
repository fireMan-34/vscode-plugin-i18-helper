import { equal } from "assert";
import clipboard from "clipboardy";
import { describe, it } from "mocha";

describe('剪切板功能测试', function(){
  const input = 'input';
  it('同步读写测试', function () {
    clipboard.writeSync(input);
    equal(clipboard.readSync(), input);
  });
});