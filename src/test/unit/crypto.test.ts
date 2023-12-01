import { describe, it,  } from 'mocha';
import { md5Hash, sha256Hash, } from 'utils/crypto';
import { equal } from 'assert';

describe('密码校验', function() {
  const password = 'password';
  it('md5 校验输出是正确的', function() {
    const result = '5f4dcc3b5aa765d61d8327deb882cf99';
    equal(md5Hash(password), result, );
  });
  it('sha256 校验输出是正确的', function() {
    const result = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
    equal(sha256Hash(password), result,);
  });
});