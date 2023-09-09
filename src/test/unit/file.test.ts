import { deepEqual } from 'assert';
import { join } from 'path';
import { describe, it, } from 'mocha';
import { checkPathIsFileOrDirectory, type FileAndDirPaths } from 'utils/fs';

const path = join(__dirname, '..');
const suit = join(path, 'suite');
const unit = join(path, 'unit');
const testPath = [ path, suit, unit ];

let dirOrFilePaths: FileAndDirPaths;

beforeEach(async function() {
    dirOrFilePaths = await checkPathIsFileOrDirectory(testPath.concat(__filename));
});

describe("测试文件类型模块", function() {
    it('测试路径识别功能', function () {
        deepEqual(dirOrFilePaths.dirPaths, testPath);
    });
});