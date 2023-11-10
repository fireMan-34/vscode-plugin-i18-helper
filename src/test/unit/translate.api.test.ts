import { BaiduTranslateEngine } from 'models/TranslateEngine';

describe('测试百度翻译 api', function() {
  it('接口应该能请求', function(done) {
    const engine = new BaiduTranslateEngine();
    engine.init();
    engine.translate('翻译内容', ['KO_KR'])
    .then((vals) => {
      console.log('vals ==========>', vals);
      done();
    })
    .catch(done);
  });
});