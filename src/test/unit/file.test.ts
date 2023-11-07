import { deepEqual, equal } from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';
import { describe, it, } from 'mocha';
import { checkPathIsFileOrDirectory, type FileAndDirPaths, getSubDirectoryFromDirectoryPath } from 'utils/fs';

const path = join(__dirname, '..');
const suit = join(path, 'suite');
const unit = join(path, 'unit');
const testPath = [ path, suit, unit ];

let dirOrFilePaths: FileAndDirPaths;
let subDirPaths: string[];

beforeEach(async function() {
    dirOrFilePaths = await checkPathIsFileOrDirectory(testPath.concat(__filename));
    subDirPaths = await getSubDirectoryFromDirectoryPath(path);
});

describe("测试文件类型模块", function() {
    it('测试路径识别功能', function () {
        deepEqual(dirOrFilePaths.dirPaths, testPath);
    });

    it('测试获取子目录功能', function() {
        deepEqual(subDirPaths, [ suit, unit  ]);
    });

    it('测试路径是否存在: 路径存在', function() {
        equal(existsSync("d:\\Study\\i18n-extension\\.i18n\\fa5dafcd319fc9e446121a358bb0c46b6e11b9c6ea1acd820e21e3b6d23ac9f5\\meta.json"), true);
    });
});