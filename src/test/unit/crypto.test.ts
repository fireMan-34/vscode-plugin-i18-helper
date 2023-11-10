import { describe, it,  } from 'mocha';
import { md5Hash } from 'utils/crypto';
import { equal } from 'assert';

describe('md 5 校验', function() {
  it('校验输出是正确的', function() {
    const password = 'password';
    const result = '5f4dcc3b5aa765d61d8327deb882cf99';
    equal(md5Hash(password), result, );
  });
});