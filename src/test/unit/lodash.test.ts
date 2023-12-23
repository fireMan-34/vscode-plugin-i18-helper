import { expect } from 'chai';
import { omit } from 'lodash';
import { describe, it } from 'mocha';

describe('lodash 疑问功能测试', function() {
    it('omit 挑选对象确认', function() {
        const uInfo = {
            email: 'email@example.com',
            power: 5,
        };
        const u = {
            ...uInfo,
            my: 'my',
        };

        expect(omit(u, [ 'my' ])).is.deep.equal(uInfo);
    });
});