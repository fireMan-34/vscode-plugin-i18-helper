import { ExtensionContext } from "vscode";
import { DEFAULT_I18N_META } from "constants/i18n";
import { existsSync, } from 'fs';
import { readFile } from "fs/promises";
import { join } from 'path';
import countBy from 'lodash/countBy';
import cloneDeep from 'lodash/cloneDeep';
import { PromiseAllMap } from "utils/asy";
import { getCharsI18nType, parseKeyAndValTexts2Object } from "utils/code";
import { writeI18nConfigJson } from "utils/conf";
import { saveJsonFile } from "utils/fs";
import { generateRuntimeProjectI18nHashPath } from "utils/path";
import { I18FileItem, XTextEditor, I18nMetaJsonSaveContentItem, I18nMetaJson, I18nType } from "types/index";

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
export class I18FileItemClass implements I18FileItem {

    /** 键值对文本提取正则 */
    static KEY_AND_VALUE_REG = /["'][^"']*?["']:\s*["'].*["'],/gi;

    /** 初始化类对象 */
    static async init(context: ExtensionContext, editor: XTextEditor) {
        this.Context = context;
        this.Editor = editor;

        this.rootPath = await generateRuntimeProjectI18nHashPath(context, editor);
        this.saveJsonPath = join(this.rootPath, 'meta.json');

        const hasMetaJson = existsSync(this.saveJsonPath);
        if (!hasMetaJson) {
            this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
            await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
        } else {
            this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
        }
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
                        .then((val) => ({ ...val, updateTime: new Date().toDateString() }) as I18nMetaJsonSaveContentItem))
        );
        i18nItems.forEach(item => this.i18nMetaJson.saveContent[item.i18nType].push(item));
        await saveJsonFile(this.saveJsonPath, this.i18nMetaJson);
        await writeI18nConfigJson(this.Context, this.Editor, this.saveJsonPath);

        this.i18nMetaJson = cloneDeep(DEFAULT_I18N_META);
    }

    /** 项目根路径 */
    static rootPath: string;
    /** 保存信息路径 */
    static saveJsonPath: string;
    /** 根 metaJson */
    static i18nMetaJson: I18nMetaJson;

    static Context: ExtensionContext;
    static Editor: XTextEditor;

    cacheMap: Partial<I18FileItem>;

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
            });
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
            });
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