import { expect } from "chai";
import { FORMAT_MESSAGE_ID_DEFAULT_MSG_WITH_VARIABLE_REGEX } from "constants/index";

const text = `This is a test.
goman like fake r23   teyt
fajkj go to 
Simple tezt case`;

// * 断言的组成之一是边界。对于文本、词或模式，边界可以用来表明它们的起始或终止部分（如先行断言，后行断言以及条件表达式）。
// * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
describe("正则巩固学习 断言篇", function () {
  it("测试单行模式匹配", function () {
    expect(/^T/.test(text)).is.true;
    expect(/e$/.test(text)).is.true;
  });

  it("测试多行模式匹配", function () {
    expect(/^g/m.test(text)).is.true;
    expect(/t$/m.test(text)).is.true;
    expect(/^S/m.test(text)).is.true;
    expect(/\.$/m.test(text)).is.true;
  });

  it("测试单词边界", function () {
    expect(/\bis\b/.test(text)).is.true;
    expect(/\br23\b/.test(text)).is.true;
    expect(/\b\w\d{2}\b/.test(text)).is.true;
  });

  // 匹配同种类的词组
  it("匹配非单词边界", function () {
    expect(/\B3/.test(text)).is.true;
    expect(/2\B/.test(text)).is.true;
    expect(/\B\B/.test(text)).is.true;
  });

  it("先行断言", function () {
    expect(/te(?=st)/.test(text)).is.true;
    expect(/te(?=yt)/.test(text)).is.true;
    expect(/te(?=zt)/.test(text)).is.true;
    expect(/te(?=st|yt}zt)/.test(text)).is.true;
  });

  it("先行否定断言", function () {
    expect(/fa(?=ke)/.test(text)).is.true;
    expect(/fa(?!ke)/.test(text)).is.true;
  });

  it("后行断言", function () {
    expect(/(?<=Th)is/.test(text)).is.true;
    expect(/(?<=\w)23/.test(text)).is.true;
  });

  it("后行否定断言", function () {
    expect(/(?<!r)23/.test(text)).is.false;
  });
});

//* 字符类 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes

describe("正则巩固学习 字符类", function () {
  it("方括号字符类", function () {
    expect(/[A-z]/.test(text)).is.true;
    expect(/[-AB]/.test(text)).is.false;
  });
  it("否定集合测试", function () {
    expect(/[^a-z]/.test("afa")).is.false;
    expect(/[-^az]/.test("afa")).is.true;
  });

  // * 匹配除行终止符之外的任何单个字符：\n, \r, \u2028 or \u2029.
  // * 在字符集内，点失去了它的特殊意义，并与文字点匹配
  // ! 需要注意的是，m multiline 标志不会改变点的行为。因此，要跨多行匹配一个模式，可以使用字符集[^]—它将匹配任何字符，包括新行。
  it(".匹配模式", function () {
    expect(/./.test("\n\r\u2008\u2029")).is.true;
    expect(/[^]/.test("\n\r\u2008\u2029")).is.true;
  });

  // * \d 相当于 [0-9]
  // * \D 相当于 [^0-9]
  // * \w 相当于 [A-Za-z0-9_]
  // * \W 相当于 [^A-Za-z0-9_]
  // * \s 匹配单个空白字符，包括空格、制表符、换页符、换行符和其他 Unicode 空格。相当于 [\f\n\r\t\v\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]。
  it("匹配单个字符", function () {
    expect(/\s+to\s+Simple/.test(text)).is.true;
  });
  // * \S 匹配除空格以外的单个字符。相当于 [^\f\n\r\t\v\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]。
  // * \t	匹配水平制表符。
  // * \r	匹配回车符。
  // * \n	匹配换行符。
  // * \v	匹配垂直制表符。
  // * \f	匹配换页符。
  // * [\b]	匹配退格键。
  // * \0	匹配一个 NUL 字符。不要在此后面加上另一个数字。
  // * \cX 使用插入符号匹配控制字符，其中“X”是 A–Z 中的一个字母（对应于代码点 U+0001–U+001F）。例如，/\cM\cJ/匹配“\r\n”。
  // * \xhh	匹配与代码 hh（两个十六进制数字）对应的字符。
  // * \uhhhhh 匹配与值 hhhh（四个十六进制数字）对应的 UTF-16 代码单元。
  // * \u{hhhh} 或 \u{hhhhh}	（仅当设置了 u 标志时。）匹配与 Unicode 值 U+hhhh 或 U+hhhhh（十六进制数字）对应的字符。
  // * \p{UnicodeProperty}，\P{UnicodeProperty}	根据字符的 Unicode 字符属性匹配字符（例如，仅匹配表情符号字符、日文片假名字符、中文汉字字符或日文汉字字符等）。
  // * 指示应特殊处理或“转义”后面的字符。它表现为两种方式之一。
  // * 对于通常按字面处理的字符，表示下一个字符是特殊的，不能按字面解释。例如，/b/ 匹配字符“b”。通过在“b”前面放置反斜杠，即使用 /\b/，字符变得特殊以表示匹配单词边界。
  // * 对于通常被特殊对待的字符，表示下一个字符不是特殊的，应该按字面意思解释。例如，“*”是一个特殊字符，表示应该匹配前面的字符出现 0 次或多次；例如，/a*/ 示匹配 0 个或多个“a”。要从字面上匹配 * 需在其前面加上反斜杠；例如，/a\*/ 匹配“a*”。
  // *备注：要从字面上匹配此字符，请将其转义。换句话说就是搜索 \ 需要使用 /\\/。
  // * x|y    析取：匹配“x”或“y”。每个由管道符 (|) 分隔的部分称为一个可选项。例如，/green|red/ 匹配“green apple”中的“green”和“red apple”中的“red”。
  // * 备注： 析取是指定“一组选择”的另一种方式，但它不是字符类。析取不是原子的——你需要使用组使其成为一个更大的模式的一部分。[abc] 在功能上等同于 (?:a|b|c)。
});

describe("正则巩固学习 组和范围", function () {
  it("x|y", function () {
    expect(/x|y/.test("x")).is.true;
    expect(/x|y/.test("y")).is.true;
    expect(/x|y/.test("xy")).is.true;
    expect(/x|y/.test("z")).is.false;
  });

  // * 字符集 匹配单个字符
  it("[xyz][a-c]", function () {
    expect(/[xyz]/.test("x")).is.true;
    expect(/[xyz]/.test("y")).is.true;
    expect(/[xyz]/.test("z")).is.true;
    expect(/[a-c]/.test("a")).is.true;
    expect(/[a-c]/.test("b")).is.true;
    expect(/[a-c]/.test("c")).is.true;
    expect(/[-ac]/.test("b")).is.false;
  });
  it("[^xyz][^a-c]", function () {
    expect(/[xyz]/.test("x")).is.true;
    expect(/[xyz]/.test("y")).is.true;
    expect(/[xyz]/.test("z")).is.true;
    expect(/[a-c]/.test("a")).is.true;
    expect(/[a-c]/.test("b")).is.true;
    expect(/[a-c]/.test("c")).is.true;
    expect(/[-ac]/.test("b")).is.false;
  });

  // *	捕获组：匹配 x 并记住匹配项。例如，/(foo)/匹配并记住“foo bar”中的“foo”
  // *  正则表达式可以有多个捕获组。结果，匹配通常在数组中捕获的组，该数组的成员与捕获组中左括号的顺序相同。这通常只是捕获组本身的顺序。当捕获组被嵌套时，这一点非常重要。使用结果元素的索引 ([1], ..., [n]) 或从预定义的 RegExp 对象的属性 ($1, ..., $9).
  it("(x)", function () {
    // * match 不带 g 时捕获组返回所有组
    expect("xy".match(/(x)y/)?.length).equal(2);
    expect("xy".match(/(x)y/g)?.length).equal(1);
    const result = [ ...Array.from("xy".matchAll(/(x)y/g)) ].flat();
    expect(result).property('length').equal(2);
  });


  it('\\n', function(){
    expect('23jfksj23fj'.match(/(\d+?).*\1/)); // 捕获组变量
  });

  // * 具名捕获
  it('(?<Name>x)', function(){
    const result = 'fireMan-34'.match(/-(?<Id>\d+)/);
    expect(result).property('1').is.string('34');
    expect(result).property('groups').property('Id').is.string('34');
  });
  // * 非捕获组
  it('(?:x)', function(){
    expect('xy'.match(/(?:x)y/)).is.not.include('x');
  });
});


describe('正则巩固学习 量词', function(){
  const code = 'xxyyyzzz';
  it('常用两次匹配模式', function(){
    expect(/u*/.test(code)).is.true;
    expect(/x+/.test(code)).is.true;
    expect(/c?/.test(code)).is.true;
    expect(/x{2}/.test(code)).is.true;
    expect(/x{3}/.test(code)).is.false;
    expect(/x{1,}/.test(code)).is.true;
    expect(/x{1,3}/.test(code)).is.true;
  });

  it('惰性匹配', function(){
    expect(code.match(/x{1,}?/)?.length).is.equal(1);
    expect(code.match(/x+?/)?.length).is.equal(1);
  });
});


describe('携带变量匹配国际化代码', function(){
  const reg = FORMAT_MESSAGE_ID_DEFAULT_MSG_WITH_VARIABLE_REGEX;
  const variable = `{
    price: 1,
    value: 2,
    current:3,
  }`;
  const code_normal = `formatMessage({id:'hah',defaultMessage:'jlfj'},${variable})`;

  const matchAll_normal = code_normal.matchAll(new RegExp(reg, 'g'));

  it('最简单的压缩模式应该能够识别', function(){
    expect(matchAll_normal).not.null;
    expect(Array.from(matchAll_normal)[0][5]).equal(variable.slice(1,-1));
  });
});

describe('匹配注释', function(){
  it('测试单行注释', function(){
    const text = `const o = {
      // 注释的内容根本是不想让人知道  
    hah: 1,
    // 另外再加
  };`;
  const reg = /^\s*\/\/.*?$/mg;
  expect(reg.exec(text)).not.null;
  expect(reg.exec(text)).not.null;
  expect(reg.exec(text)).is.null;
  });

  it('匹配范围注释，无换行等', function(){
    const text = `const o = {
      /**  
       * kjfkaj 
       * kjkfja
      */ girl,firman
      jfa/** fjks*/jf
    }`;
    const reg = /\/\*\*[^]*?\*\//g;
    expect(reg.exec(text)).not.null;
    expect(reg.exec(text)).not.null;
    expect(reg.exec(text)).is.null;
  });
});

describe('匹配文本', function(){
  it('匹配得到', function(){
    const str = `formatMessage({
      id: 'xx',
      defaultMessage; 'xx',
    });`;
    console.log('matchResult', str.match(/\).*?$/));
    expect(/\).*?$/.test(str)).is.true;
  });
});