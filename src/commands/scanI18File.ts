import * as vscode from "vscode";
import { join } from "path";
import { existsSync } from 'fs';
import { readFile,  } from "fs/promises";
import { countBy, cloneDeep, } from 'lodash';
import { readDeepDir, readJsonFile, saveJsonFile } from 'utils/fs';
import { parseKeyAndValTexts2Object, getCharsI18nType } from 'utils/code';
import { generateRuntimeProjectI18nHashPath } from 'utils/str';
import { PromiseAllMap } from 'utils/asy';
import { DEFAULT_I18N_META } from 'commands/constant';
import { ICommondItem, I18nType, XTextEditor, I18nMetaJsonSaveContentItem, I18nMetaJson } from 'commands/type';

interface I18FileItem {
  /** 文件路径 */
  path: string;
  /** 国际化类型 */
  i18nType: Promise<I18nType>,
  /** 国际化键值对 */
  keyAndVals: Promise<string[]>;
  /** 国际化解析 map 对象 */
  parseKeyAndVals: Promise<Record<string, string>>;
  /** 获取文件 utf-8 解析内容 */
  getFileContent: () => Promise<string>;
}

class I18FileItemClass implements I18FileItem {

  /** 键值对文本提取正则 */
  static KEY_AND_VALUE_REG = /["'][^"']*?["']:\s*["'].*["'],/gi;

  /** 初始化类对象 */
  static async init(context: vscode.ExtensionContext, editor: XTextEditor) {
    this.rootPath = await generateRuntimeProjectI18nHashPath(context, editor);
    this.saveJsonPath = join(this.rootPath, 'meta.json');

    const hasMetaJson = existsSync(this.saveJsonPath);
    if (!hasMetaJson) {
      this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
      await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    } else {
      this.i18nMetaJson = await readJsonFile<I18nMetaJson>(this.saveJsonPath);
    }
  }

  /** 将国际化内容写入路径中 */
  static async writeI18FileContent2Json(set: I18FileItem[]) {
    const i18nItems = await Promise.all(
      set
        .map((item) =>
          PromiseAllMap({
            i18nType: item.i18nType,
            content: item.parseKeyAndVals,
            path: Promise.resolve(item.path),
          })
            .then((val) => ({ ...val, updateTime: Date.now().toLocaleString() }) as I18nMetaJsonSaveContentItem))
    );
    i18nItems.forEach(item => this.i18nMetaJson.saveContent[item.i18nType].push(item));
    await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    
    this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
  }

  /** 项目根路径 */
  static rootPath: string;
  /** 保存信息路径 */
  static saveJsonPath: string;
  /** 根 metaJson */
  static i18nMetaJson: I18nMetaJson;

  cacheMap: Partial<I18FileItem>

  path: string;

  constructor(path: string) {
    this.cacheMap = {};
    this.path = path;
  }

  get i18nType(): Promise<I18nType> {
    if (this.cacheMap.i18nType) {
      return this.cacheMap.i18nType;
    }
    return this.parseKeyAndVals
      .then((record) => {
        const list = Object.values(record);
        const i18Types = list.map(getCharsI18nType);
        const countMap = countBy(i18Types);
        const i18nType = +Object
          .entries(countMap)
          .reduce((maxKeyAndVal, curKeyAndVal) => curKeyAndVal[1] > maxKeyAndVal[1] ? curKeyAndVal : maxKeyAndVal, [`${I18nType.UN_KNOWN}`, 0])
        [0] as I18nType;
        return i18nType;
      })
  }

  get keyAndVals(): Promise<string[]> {
    if (this.cacheMap.keyAndVals) {
      return this.cacheMap.keyAndVals;
    }
    else {
      return this.getFileContent().then((content) => {
        const keyAndVals = content.match(I18FileItemClass.KEY_AND_VALUE_REG) || [''];
        this.cacheMap.keyAndVals = Promise.resolve(keyAndVals);
        return keyAndVals;
      })
    }
  }

  get parseKeyAndVals(): Promise<Record<string, string>> {
    if (this.cacheMap.parseKeyAndVals) {
      return this.cacheMap.parseKeyAndVals;
    }
    else {
      return this.keyAndVals.then((keyAndVals) => {
        const lines = keyAndVals.reduce((acc, key) => acc + key, '');
        const object = parseKeyAndValTexts2Object(lines) as Record<string, string>;
        this.cacheMap.parseKeyAndVals = Promise.resolve(object);
        return object;
      });
    }
  }

  getFileContent: () => Promise<string> = () => {
    if (this.cacheMap.getFileContent) {
      return this.cacheMap.getFileContent();
    }
    else {
      return readFile(this.path, { encoding: 'utf-8' }).then(content => {
        this.cacheMap.getFileContent = () => Promise.resolve(content);
        return content;
      });
    }
  };
}

/** 扫描国际化文件 */
const SCAN_I18_FILE = 'i18.scanI18File';

/** 扫描国际化文件 */
const scanI18File: ICommondItem['cmdExcuter'] = async (context, eidtor) => {
  const dirPath = eidtor.fsPath;
  const rootPath = join(dirPath, '..');
  vscode.window.showInformationMessage('准备扫描', rootPath, context.extension.extensionPath);

  try {
    await I18FileItemClass.init(context, eidtor);

    vscode.window.showInformationMessage('插件根路径', I18FileItemClass.rootPath);

    const { filePaths } = await readDeepDir(dirPath);
    const i18nFileItems = filePaths.map(path => new I18FileItemClass(path));

    await I18FileItemClass.writeI18FileContent2Json(i18nFileItems);

  } catch (err) {
    console.error(err);
  }
};
/** 注册扫描文件上下文
 * @see https://code.visualstudio.com/api/references/when-clause-contexts
 */
const excuter = (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage('扫描文件已执行');
  vscode.commands.executeCommand('setContext', 'ext.supportedFolders', ['dist', 'out', 'locales']);
};

/** 打开界面视图指令
 * @see https://code.visualstudio.com/api/references/activation-events
 */
const item: ICommondItem = {
  cmd: SCAN_I18_FILE,
  cmdExcuter: scanI18File,
  excuter,
};
export default item;

export {
  SCAN_I18_FILE,
  scanI18File,
  excuter,
};