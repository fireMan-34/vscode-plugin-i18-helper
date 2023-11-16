import { equal } from 'assert';
import { BaiduTranslateEngine } from 'models/TranslateEngine';

describe('测试百度翻译 api', function() {
  it('测试 签名 函数', function() {
    const outSign = 'f89f9594663708c1605f3d736d01d2d4';
    const engine = new BaiduTranslateEngine();
    engine.appId = '2015063000000001';
    engine.salt = '1435660288';
    engine.appSecrect = '12345678';
    equal(engine.createSign('apple',), outSign);
  });

  it('接口应该能请求', function(done) {
    const engine = new BaiduTranslateEngine();
    engine.init();
    engine.translate('翻译内容', ['KO_KR'])
    .then((vals) => {
      done();
    })
    .catch(done);
  });
});