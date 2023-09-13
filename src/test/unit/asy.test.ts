import { equal } from 'assert';
import { beforeEach, describe } from 'mocha';
import { asyncChain } from 'utils/asy';

let result: number;

beforeEach(async function () {
    const asyncTask1 = () => Promise.reject();
    const asyncTask2 = () => Promise.reject('no thing result , but rejected');
    const asyncTask3 = () => Promise.resolve(3);
    const asyncTask4 = () => Promise.resolve(4);

    const asyncTasks = [ asyncTask1, asyncTask2, asyncTask3, asyncTask4 ];

    result = await asyncChain(asyncTasks);
});

describe('测试异步工具函数', function(){
    it('异步返回结果应该存在且为3', function() {
        equal( result, 3);
    });
});