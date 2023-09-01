import { 
  workspace,
  window,
  commands, 
  type ExtensionContext,
} from "vscode";
import { join } from "path";
import { existsSync } from 'fs';
import { readFile, } from "fs/promises";
import countBy from 'lodash/countBy';
import cloneDeep from 'lodash/cloneDeep';
import { readDeepDir, saveJsonFile, readJsonFile } from 'utils/fs';
import { parseKeyAndValTexts2Object, getCharsI18nType } from 'utils/code';
import { generateRuntimeProjectI18nHashPath, getRunTimeConfigPath, getWrokspaceFloder } from 'utils/path';
import { PromiseAllMap } from 'utils/asy';
import { DEFAULT_I18N_META } from 'commands/constant';
import {
  ICommondItem,
  I18nType,
  XTextEditor,
  I18nMetaJsonSaveContentItem,
  I18nMetaJson,
  I18FileItem,
  i18nDirItem,
  ProjectMetaJson,
} from 'types/index';

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
class I18FileItemClass implements I18FileItem {

  /** 键值对文本提取正则 */
  static KEY_AND_VALUE_REG = /["'][^"']*?["']:\s*["'].*["'],/gi;

  /** 初始化类对象 */
  static async init(context: ExtensionContext, editor: XTextEditor) {
    this.rootPath = await generateRuntimeProjectI18nHashPath(context, editor);
    this.excutePath = editor.fsPath;
    this.saveJsonPath = join(this.rootPath, 'meta.json');

    const hasMetaJson = existsSync(this.saveJsonPath);
    if (!hasMetaJson) {
      this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
      await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
    } else {
      // this.i18nMetaJson = await readJsonFile<I18nMetaJson>(this.saveJsonPath);
      this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
    }
    this.extensionMetaJsonPath = getRunTimeConfigPath(context);
  }

  /** 将国际化内容写入路径中 */
  static async writeI18nFileContent2Json(set: I18FileItem[]) {
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
    
    await this.writeI18nConfigJson();
  }

  /** 写入国际化全局配置 */
  static async writeI18nConfigJson() {
    const projectMetaJson = await readJsonFile<ProjectMetaJson>(this.extensionMetaJsonPath);
    const projectPath = await getWrokspaceFloder();
    const item: i18nDirItem = {
      originalPath: this.excutePath,
      targetPath: this.saveJsonPath,
      projectPath: projectPath.uri.fsPath,
    };

    if (!projectMetaJson.i18nDirList.find(dirItem => 
      dirItem.originalPath === item.originalPath
     && dirItem.targetPath === item.targetPath 
      )) {
        projectMetaJson.i18nDirList.push(item);

        await saveJsonFile(this.extensionMetaJsonPath, projectMetaJson);
    }
  }

  /** 项目根路径 */
  static rootPath: string;
  /** 命令执行路径 */
  static excutePath: string;
  /** 保存信息路径 */
  static saveJsonPath: string;
  /** 根 metaJson */
  static i18nMetaJson: I18nMetaJson;
  /** 项目根配置 */
  static extensionMetaJsonPath: string;

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
        const i18nTypes = list.map(getCharsI18nType);
        const countMap = countBy(i18nTypes);
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
const SCAN_I18_FILE = 'i18n.scanI18File';

/** 扫描国际化文件
 * 命令扫描符合文件目录 生成可使用的数据结构供 国际化插件使用
 * 步骤拆解
 * * 1. 获取扫描 、 插件目录基础信息 - [x]
 * * 2. 获取扫描目录所有文件信息 - [x]
 * * 3. 提取文本对应的国际化文本对象 - [x]
 * * 4. 国际化文本分类 - [x]
 * * 5. 存储国际化文本 - [x]
 * * 6. 存储全局初始化文件配置 - [ ]
 * * 7. 全局任务通信 （Rxjs） - [ ]
 * * 8. 智能提示 - []
 * * 9. 完善读取缓存更新逻辑 - [ ]
 * * 10.多项目管理 - [ ]
 * * 11.资源视图管理 - [ ]
 * * 12. vscode 配置支持 - [ ] 
 */
const scanI18File: ICommondItem['cmdExcuter'] = async (context, eidtor) => {
  const dirPath = eidtor.fsPath;
  const rootPath = join(dirPath, '..');
  window.showInformationMessage('准备扫描', rootPath, context.extension.extensionPath);

  try {
    await I18FileItemClass.init(context, eidtor);

    window.showInformationMessage('插件根路径', I18FileItemClass.rootPath);

    const { filePaths } = await readDeepDir(dirPath);
    const i18nFileItems = filePaths.map(path => new I18FileItemClass(path));

    await I18FileItemClass.writeI18nFileContent2Json(i18nFileItems);

  } catch (err) {
    console.error(err);
  }
};
/** 注册扫描文件上下文
 * @see https://code.visualstudio.com/api/references/when-clause-contexts
 */
const excuter = (context: ExtensionContext) => {
  window.showInformationMessage('扫描文件已执行');
  commands.executeCommand('setContext', 'ext.supportedFolders', ['dist', 'out', 'locales']);
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