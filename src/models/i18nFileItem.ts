import { ExtensionContext } from "vscode";
import { DEFAULT_I18N_META } from "constants/i18n";
import { existsSync, } from 'fs';
import { readFile } from "fs/promises";
import { join } from 'path';
import countBy from 'lodash/countBy';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { PromiseAllMap, asyncChain } from "utils/asy";
import { getCharsI18nType, parseKeyAndValTexts2Object } from "utils/code";
import { writeI18nConfigJson, getSaveJsonConfig } from "utils/conf";
import { saveJsonFile } from "utils/fs";
import { generateRuntimeProjectI18nHashPath, getPathSameVal, isSubPath } from "utils/path";
import { I18nFileItem, XTextEditor, I18nMetaJsonSaveContentItem, I18nMetaJson, I18nType, I18nRuleDirItem } from "types/index";

/** 默认 文件 utf-8 字符范围频率 判断国际化类型 */
class BaseFile2I18nTypeClass {
    file: I18nFileItemClass;

    constructor(file: I18nFileItemClass) {
        this.file = file;
    }

    isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
        return Promise.resolve(this);
    };

    getI18nType(): Promise<I18nType> {
        const file = this.file;

        return file.parseKeyAndVals
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
}

class RuleDir2I18nTypeClass extends BaseFile2I18nTypeClass {

    suitI18nRuleDirList: I18nRuleDirItem[] = [];

    constructor(file: I18nFileItemClass) {
        super(file);
    }

    async isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
        const file = this.file;
        const { i18nRuleDirList } = await getSaveJsonConfig(I18nFileItemClass.Context);
        this.suitI18nRuleDirList = i18nRuleDirList.filter((dirItem) => isSubPath(dirItem.rulePath, file.path));
        if (isEmpty(this.suitI18nRuleDirList)) {
            return Promise.reject();
        }
        return this;
    }

    async getI18nType(): Promise<I18nType> {
        const i18nDirRuleItem = this.suitI18nRuleDirList
            .map((item) => ({
                item,
                point: getPathSameVal(item.rulePath, this.file.path),
            }))
            .reduce((acc, cur) => {
                if (!acc) { return cur; };
                return acc.point >= cur.point ? acc : cur;
            }).item;
        return I18nType[i18nDirRuleItem.i18nType]
    }
}

/**
 * @todo 国际化文件对象 有点稍微臃肿
 */
export class I18nFileItemClass implements I18nFileItem {

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
    static async writeI18nFileContent2Json(set: I18nFileItem[]) {
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

    i18nFile2Types: BaseFile2I18nTypeClass[];

    cacheMap: Partial<I18nFileItem>;

    path: string;

    constructor(path: string) {
        this.cacheMap = {};
        this.path = path;
        this.i18nFile2Types = [
            new RuleDir2I18nTypeClass(this),
            new BaseFile2I18nTypeClass(this),
        ];
    }

    get i18nType(): Promise<I18nType> {
        if (this.cacheMap.i18nType) {
            return this.cacheMap.i18nType;
        }

        return new Promise((resolve, reject) => {
            asyncChain(
                this.i18nFile2Types.map(
                    i18nFile2i18nType => () => i18nFile2i18nType.isThisTransformer()
                ))
                .then((i18nFile2Type) => {
                    i18nFile2Type.getI18nType().then(resolve);
                })
                .catch((err) => reject(err));
        });
    }

    get keyAndVals(): Promise<string[]> {
        if (this.cacheMap.keyAndVals) {
            return this.cacheMap.keyAndVals;
        }
        else {
            return this.getFileContent().then((content) => {
                const keyAndVals = content.match(I18nFileItemClass.KEY_AND_VALUE_REG) || [''];
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