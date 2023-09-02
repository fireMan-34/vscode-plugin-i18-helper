import { equal } from 'assert';
import { describe, it, } from 'mocha';
import { isSamePath, isSubPath } from 'utils/path';

describe('路径匹配测试', function () {
    const workspaceFolderPaths = [
        'D:/Project/pro-micro-services',
        'D:\\Project\\pro-micro-services',
        'D:/Project/myBlog',
        'D:/Project/antdesign',
    ];

    const testPaths = [
        'D:/Project/pro-micro-services/projects/platform/common/locales',
        'D:/Project',
    ];

    it('测试路径工作空间路径是否包含该路径吗', function() {
        equal(isSubPath(workspaceFolderPaths[0],testPaths[0],), true);
    });
    
    it('测试是否是相同路径', function() {
        equal(isSamePath(workspaceFolderPaths[0],workspaceFolderPaths[1],), true);
    });

});