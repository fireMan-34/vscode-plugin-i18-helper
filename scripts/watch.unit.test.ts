import process from 'process';
import { exec, } from 'child_process';
import { join } from 'path';
import { watch, } from 'fs/promises';
import { debounce } from 'lodash';

const ac = new AbortController();

const filePath = join(__dirname, '../src/test/unit');



// 目前仅用于测试 typescript 的 api
(async function () {
    const debounceFn = debounce((change) => {
        console.log('文件变更', change);
        const c = exec(`npm run test:unit ${'unit/!(type)/**'}`);
        c.stdout?.on('data', console.log);
    }, 1340);
    for await (const change of watch(filePath, { recursive: true, encoding: 'utf8', signal: ac.signal })) {
        debounceFn(change);
    }
})();

process.on('beforeExit', () => {
    ac.abort();
    console.log('取消文件变更监听');
});