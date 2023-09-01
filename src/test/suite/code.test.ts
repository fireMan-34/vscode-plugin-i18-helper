import { equal } from 'node:assert';
import { describe, it, } from 'mocha';
import { getCharsI18nType } from 'utils/code';
import { I18nType } from 'types/index';

describe('国际化文本检测测试', function () {
  it('中文繁体检测 1级', function () {
    equal(getCharsI18nType('應用管理'), I18nType.ZH_HK);
  });
  it('中文繁体检测 2级', function() {
    equal(getCharsI18nType('你正在刪除問題，問題刪除後該問題與其他問題的關聯關係也會取消，確認繼續嗎？'), I18nType.ZH_HK,);
  });
  it('中文简体检测 1级', function() {
    equal(getCharsI18nType('搜索提示二'), I18nType.ZH_CN,);
  });
  it('英文检测 1级', function() {
    equal(getCharsI18nType('Please press the "Refresh" button to reload current page'), I18nType.EN_US,);
  });
  it('韩文检测 1级', function() {
    equal(getCharsI18nType('상품의 가격 곡선을 표시할 수 있습니다.마우스를 가격 표시줄로 이동할 때 현재 규격 상품의 역사적 가격 변화를 표시합니다.'), I18nType.KO_KR,);
  });
  it('日文检测 1级', function() {
    equal(getCharsI18nType('お問い合わせ中'), I18nType.JA_JP,);
  });
});