import { existsSync, mkdirSync, writeFileSync, writeSync } from 'fs';
import { readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { join, } from 'node:path';

const TEST = false;

/** 读取深度子文件 */
export async function readDeepDir(path: string) {
  const loopPaths = [ path ];
  const filePaths: string[] = [];
  const dirPaths: string[] = [];

  /** 获取子文件目录下的真实文件路径 */
  function readDirIncludeFilePaths (path: string) {
    return readdir(path,).then(fileNames => fileNames.map(fileName => join(path, fileName)));
  };
  
  function checkFileOrDirPaths (paths: string[]) {
    return Promise.all(paths.map(path => stat(path)))
    .then((stats) => { stats.forEach((stat, index) => {
      const path = paths[index];
      if (stat.isDirectory()) {
        dirPaths.push(path);
        loopPaths.push(path);
        return;
      }
      if (stat.isFile()) {
        filePaths.push(path);
        return;
      }
      throw new Error(`unknown file path is ${path}`);
    });});
  };

  while (loopPaths.length) {
    const fileOrDirPaths = (await Promise.all(loopPaths.map(readDirIncludeFilePaths))).flat();

    loopPaths.length = 0;
    
    await checkFileOrDirPaths(fileOrDirPaths);
  };

  return {
    /** 文件路径 */
    filePaths,
    /** 文件容器路径 */
    dirPaths,
  } as const;
}

/** 生成文件夹如果路径上没有找到 */
export function generatDirPathIfNone (path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
};

/** 保存 json 格式数据 */
export async function saveJsonFile<T extends object>(path: string, data: T) {
  return writeFile(path,JSON.stringify(data, null, 2), { encoding: 'utf8' });
};

/** 保存 json 格式数据 同步 */
export function saveJsonFileSync<T extends object>(path: string, data: T) {
  return writeFileSync(path,JSON.stringify(data, null, 2), { encoding: 'utf8' });
};

/** 读取 json 格式数据 */
export async function readJsonFile<T extends object>(path: string) {
  return readFile(path, { encoding: 'utf-8' }).then(JSON.parse) as Promise<T>;
};

if (TEST) {
  // * 测试深层路径读取功能
  readDeepDir(join(__dirname, '..'))
  .then(console.log);
}