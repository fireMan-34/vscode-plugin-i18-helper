import { describe, it, } from 'mocha';
import { equal, } from 'node:assert';
import {
  FORMAT_MESSAGE_ID_REGEX,
  FORMAT_MESSAGE_REGEX,
  I18N_T_REGEX
} from 'constants/index';
import { I18nType } from 'types/index';
import {
  generateDynamicTemplateString,
  generateTemplateStringToRegex,
  getCharsI18nType,
} from 'utils/code';

describe('国际化文本检测测试', function () {
  it('中文繁体检测 1级', function () {
    equal(getCharsI18nType('應用管理'), I18nType.ZH_HK);
  });
  it('中文繁体检测 2级', function () {
    equal(getCharsI18nType('你正在刪除問題，問題刪除後該問題與其他問題的關聯關係也會取消，確認繼續嗎？'), I18nType.ZH_HK,);
  });
  it('中文简体检测 1级', function () {
    equal(getCharsI18nType('搜索提示二'), I18nType.ZH_CN,);
  });
  it('英文检测 1级', function () {
    equal(getCharsI18nType('Please press the "Refresh" button to reload current page'), I18nType.EN_US,);
  });
  it('韩文检测 1级', function () {
    equal(getCharsI18nType('상품의 가격 곡선을 표시할 수 있습니다.마우스를 가격 표시줄로 이동할 때 현재 규격 상품의 역사적 가격 변화를 표시합니다.'), I18nType.KO_KR,);
  });
  it('日文检测 1级', function () {
    equal(getCharsI18nType('お問い合わせ中'), I18nType.JA_JP,);
  });
});

describe('代码提示 formatMessage 系列', function () {
  it('测试普通一行输入 匹配', function () {
    equal(FORMAT_MESSAGE_REGEX.test(`intl.formatMessage({`), true);
  });

  it('普通测试一行 匹配相对多', function () {
    equal(FORMAT_MESSAGE_REGEX.test(`formatMessage({  }`), true);
  });
});

describe('代码自动跳转', function () {
  it('测试识别普通键值对', function () {
    equal(FORMAT_MESSAGE_ID_REGEX.test(`id: '1234'`), true);
  });
  it('测试识别对象键值对', function () {
    equal(FORMAT_MESSAGE_ID_REGEX.test(`{id: '1234'}`), true);
  });
  it('测试识别对象双引号键值对', function () {
    equal(FORMAT_MESSAGE_ID_REGEX.test(`{"id": "1234"}`), true);
  });
  it('测试识别函数调用对象双引号键值对', function () {
    equal(FORMAT_MESSAGE_ID_REGEX.test(`({"id": "1234"}),`), true);
  });


  it('测试提取普通键值对', function () {
    equal(`id: '1234'`.match(FORMAT_MESSAGE_ID_REGEX)?.[1], '1234');
  });
  it('测试提取对象键值对', function () {
    equal(`{id: '1234'}`.match(FORMAT_MESSAGE_ID_REGEX)?.[1], '1234');
  });
  it('测试提取对象双引号键值对', function () {
    equal(`{"id": "1234"}`.match(FORMAT_MESSAGE_ID_REGEX)?.[1], '1234');
  });
  it('测试提取函数调用对象双引号键值对', function () {
    equal(`({"id": "1234"}),`.match(FORMAT_MESSAGE_ID_REGEX)?.[1], '1234');
  });
});

describe('代码模板测试解析生成', function () {
  const ctx = {
    id: 'i18n.key',
    message: 'i18n.value',
  };
  const template_1 = [
    "formatMessage({",
    " id: '${id}'",
    " defaultMessage: '${message}'",
    "})",
  ].join('\n');
  const render_1 = [
    "formatMessage({",
    " id: 'i18n.key'",
    " defaultMessage: 'i18n.value'",
    "})",
  ].join('\n');

  const template_2 = [
    "t({",
    " id: '${id}'",
    " defaultMessage: '${message}'",
    "})",
  ].join('\n');
  const render_2 = [
    "t({",
    " id: 'i18n.key'",
    " defaultMessage: 'i18n.value'",
    "})",
  ].join('\n');

  const template_3 = [
    "t(${id}, ${message})",
  ].join('\n');
  const render_3 = [
    "t(i18n.key, i18n.value)",
  ].join('\n');
  const template_4 = [
    "$t(${id})",
  ].join('\n');
  const render_4 = [
    "$t(i18n.key)",
  ].join('\n');

  it('判断默认渲染文本函数是否生效', function () {
    equal(generateDynamicTemplateString(template_1, ctx), render_1);
  });

  it('判断默认缩写调用函数文本是否生效', function () {
    equal(generateDynamicTemplateString(template_2, ctx), render_2);
  });
  it('判断默认缩写多参调用函数文本是否生效', function () {
    equal(generateDynamicTemplateString(template_3, ctx), render_3);
  });
  it('生成 vue 国际化代码测试', function () {
    equal(generateDynamicTemplateString(template_4, ctx), render_4);
  });
});

describe('测试 i18n 调用 t 的方式', function () {
  it('默认输入文本匹配', function () {
    equal(I18N_T_REGEX.test("i18n.t('xxxx')"), true);
  });
  it('默认输入双引号文本匹配', function () {
    equal(I18N_T_REGEX.test('i18n.t("xxxx")'), true);
  });
});

describe('测试动态模板转换正则功能', function () {
  const generateTemplate = "getMessage('${id}','${msg}')";

  it('验证动态模板正则是否可以生成', function () {
    const result = generateTemplateStringToRegex(generateTemplate);
    equal(!!(result.fullRegStr && result.partRegStr), true);
  });

  it('验证动态模板正则输出比较', function () {
    const result = generateTemplateStringToRegex(generateTemplate);

    equal(result.partRegStr, 'getMessage\\(');
    equal(result.fullRegStr, 'getMessage\\([\\s|\\n]*("|\')(.*?)\\1[\\s|\\n]*,[\\s|\\n]*("|\')(.*?)\\3,?[\\s|\\n]*\\)');

  });

  it('动态模板转换单行匹配测试', function () {
    const result = generateTemplateStringToRegex(generateTemplate);
    const code = `getMessage('auth.logn', 'haha');`;
    const reg = {
      full: new RegExp(result.fullRegStr,),
      part: new RegExp(result.partRegStr,),
    };
    equal(reg.part.test(code), true);
    equal(reg.full.test(code), true);
  });

  it('动态模板转换多行匹配测试', function () {
    const result = generateTemplateStringToRegex(generateTemplate);
    const reg = {
      part: new RegExp(result.partRegStr, 'm'),
      full: new RegExp(result.fullRegStr, 'm'),
    };
    const code = `
    getMessage(
      'no.login.hah',
      'goHere',
    )`;
    equal(reg.part.test(code), true);
    equal(reg.full.test(code), true);
  });

  it('动态正则末尾去掉，加结束符号。', function () {
    const result = generateTemplateStringToRegex(generateTemplate);
    const code = `
    getMessage("auth.logn",   
    'no.get');
    `;
    const reg = {
      part: new RegExp(result.partRegStr, 'm'),
      full: new RegExp(result.fullRegStr, 'm'),
    };
    equal(reg.part.test(code), true);
    equal(reg.full.test(code), true);
  });

  it('动态正则内容提取测试', function () {
    const result = generateTemplateStringToRegex(generateTemplate);
    const i18nKey = "login.submit";
    const i18nVal = '登录';
    const code = `getMessage("${i18nKey}",'${i18nVal}')`;
    const r = result.getI18nKeyAndVal(code);
    equal(r.key, i18nKey);
    equal(r.val, i18nVal);
  });
});