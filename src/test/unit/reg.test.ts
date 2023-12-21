// import { describe, it } from 'mocha';
import { expect } from 'chai';

const text = `This is a test.
goman like fake r23   teyt
Simple tezt case`;

// * 断言的组成之一是边界。对于文本、词或模式，边界可以用来表明它们的起始或终止部分（如先行断言，后行断言以及条件表达式）。
// * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
describe('正则巩固学习 断言篇', function(){
    it('测试单行模式匹配', function(){
        expect(/^T/.test(text)).is.true;
        expect(/e$/.test(text)).is.true;
    });

    it('测试多行模式匹配', function(){
        expect(/^g/m.test(text)).is.true;
        expect(/t$/m.test(text)).is.true;
        expect(/^S/m.test(text)).is.true;
        expect(/\.$/m.test(text)).is.true;
    });

    it('测试单词边界', function(){
        expect(/\bis\b/.test(text)).is.true;
        expect(/\br23\b/.test(text)).is.true;
        expect(/\b\w\d{2}\b/.test(text)).is.true;
    });

    // 匹配同种类的词组
    it('匹配非单词边界', function(){
        expect(/\B3/.test(text)).is.true;
        expect(/2\B/.test(text)).is.true;
        expect(/\B\B/.test(text)).is.true;
    });


    it('先行断言', function(){
        expect(/te(?=st)/.test(text)).is.true;
        expect(/te(?=yt)/.test(text)).is.true;
        expect(/te(?=zt)/.test(text)).is.true;
        expect(/te(?=st|yt}zt)/.test(text)).is.true;
    });

    it('先行否定断言', function(){
        expect(/fa(?=ke)/.test(text)).is.true;
        expect(/fa(?!ke)/.test(text)).is.false;
    });

    it('后行断言', function(){
        expect(/(?<=Th)is/.test(text)).is.true;
        expect(/(?<=\w)23/.test(text)).is.true;
    });

    it('后行否定断言', function(){
        expect(/(?<!r)23/.test(text)).is.false;
    });

});

//* 字符类 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes