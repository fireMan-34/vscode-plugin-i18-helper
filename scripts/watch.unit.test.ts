import process from "process";
import { exec } from "child_process";
import { join } from "path";
import { watch } from "fs/promises";
import { debounce } from "lodash";
import { GlobSync } from "glob";

const ac = new AbortController();

const dirPath = join(__dirname, "../src/test/unit");

// 目前仅用于测试 typescript 的 api
(async function () {
  const debounceFn = debounce((change) => {
    console.log("文件变更", change);
    const c = exec(`npm run test:unit ${"unit/!(type)/**"}`);
    c.stdout?.on("data", console.log);
  }, 1340);
  const files = new GlobSync("**/type/*.test.ts", {
    cwd: dirPath,
    realpath: true,
  }).found;
  const [ file ] = files;
  for await (const change of watch(file, { encoding: "utf8", signal: ac.signal })) {
    debounceFn(change);
  }
})();

process.on("beforeExit", () => {
  ac.abort();
  console.log("取消文件变更监听");
});
