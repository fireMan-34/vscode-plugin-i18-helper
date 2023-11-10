// glob test
import { glob, } from 'glob';
import { describe, it } from 'mocha';
import { join } from 'path';
import { equal } from 'assert';
import { map } from 'lodash/fp';
import { isSamePath } from 'utils/path';

describe('glob study test', function () {
  const TEST_FILE_1 = join(__dirname, './glob.test.json');
  const TEST_FILE_2 = join(__dirname, './.cd/like.test.json');
  const createFilePathMap = (cwd: string,) => map((fileName: string) => join(cwd, fileName));
  
  it('* 在测试所在目录，应该能够匹配局部文件', function (done) {
    glob('glob*.json',{ cwd: __dirname, }, (err, files) => {
      if (err) {
        return done(err);
      }
      const [outfile] = createFilePathMap(__dirname)(files);
      equal(isSamePath(outfile, TEST_FILE_1),true);
      done();
    });
  });

  it('? 在目录钟应该能够匹配到路径', function (done) {
    glob('glob?te?t?json', { cwd: __dirname }, (err, fiels) => {
      if (err) {
        return done(err);
      }
      const [outfile] = createFilePathMap(__dirname)(fiels);
      equal(isSamePath(outfile, TEST_FILE_1), true);
      done();
    });
  });

  it('特殊带 * 文件路径测试，默认 ** 无法匹配到文件,', function (done) {
    glob('**/*.test.json', { cwd: __dirname }, (err, fielNames) => {
      if (err) {
        return done(err);
      }
      const fies = createFilePathMap(__dirname)(fielNames);
      equal(fies.length, 1);
      done();
    });
  });
  it('特殊带 * 文件路径测试，默认 ** 使用 dot 为 true,', function (done) {
    glob('**/*.test.json', { cwd: __dirname, dot: true }, (err, fielNames) => {
      if (err) {
        return done(err);
      }
      const fies = createFilePathMap(__dirname)(fielNames);
      equal(fies.length, 2);
      done();
    });
  });
  it('特殊带 * 文件路径测试，默认 .* 可以匹配到文件', function (done) {
    glob('src/test/**/.*/*.test.json', {}, (err, fielNames) => {
      if (err) {
        return done(err);
      }
      const [ outfile ] = createFilePathMap(process.cwd())(fielNames);
      equal(isSamePath(outfile, TEST_FILE_2), true);
      done();
    });    
  });
  it('特殊带 * 文件路径测试，默认 .* 可以匹配到文件,但无法匹配任意路径', function (done) {
    glob('.*/*.test.json', { cwd: __dirname, }, (err, fileNames) => {
      if (err) {return done(err);}
      const files = createFilePathMap(process.cwd())(fileNames);
      
      equal(files.length, 1);
      done();
    });
  });
  // 测试用例存在问题 似乎属性 matchBase 无法验证功能
  it('matchBase 为 true 且 无 / 可以匹配目录下的任何子叶，否则匹配当前所在目录', function (done) {
    glob('*.json', { cwd: __dirname, matchBase: true }, (err, fileNames) => {
      if (err) {return done(err);}
      console.log(fileNames);
      const files = createFilePathMap(__dirname)(fileNames);
      equal(files.length, 2);
      done();
    });
  });
});
