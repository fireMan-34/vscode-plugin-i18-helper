import { ExtensionContext, Uri, workspace } from 'vscode';
import pick from 'lodash/pick';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ProjectMetaJson, i18nDirItem, XTextEditor } from "types/index";
import { readJsonFile, saveJsonFile } from "utils/fs";
import { getWrokspaceFloder, getRunTimeConfigPath } from "utils/path";
import { PROJECT_META_JSON, EXTENSION_NAME,  VSCODE_KEYS } from 'constants/index';

/** 全局发布订阅中心 */
export const GlobalExtensionSubject = new BehaviorSubject<ProjectMetaJson>(PROJECT_META_JSON);

/** 读取国际化全局配置 国际化信息 */
export async function readConfigJson(context: ExtensionContext) {
    /** 全局插件 元信息位置 */
    const extensionMetaJsonPath = await getRunTimeConfigPath(context);
    const extendMetaJson = await readJsonFile<ProjectMetaJson>(extensionMetaJsonPath);
    const refreshReadConfig = {
        ...extendMetaJson,
        ...pick(workspace.getConfiguration(EXTENSION_NAME), VSCODE_KEYS),
    };
    return refreshReadConfig;
};

/** 写入国际化全局配置 国际化信息 */
export async function writeI18nConfigJson(context: ExtensionContext, excuter: XTextEditor | Uri, saveJsonPath: string) {
    /** 全局插件 元信息位置 */
    const extensionMetaJsonPath = await getRunTimeConfigPath(context);
    /** 执行路径 */
    const excutePath = excuter.fsPath;

    const projectMetaJson = await readJsonFile<ProjectMetaJson>(extensionMetaJsonPath);
    const projectPath = await getWrokspaceFloder();
    const item: i18nDirItem = {
        originalPath: excutePath,
        targetPath: saveJsonPath,
        projectPath: projectPath.uri.fsPath,
    };

    if (!projectMetaJson.i18nDirList.find(dirItem =>
        dirItem.originalPath === item.originalPath
        && dirItem.targetPath === item.targetPath
    )) {
        projectMetaJson.i18nDirList.push(item);

        await refreshI18nConfigJson(context,
            {
                runTimeConfigPath: extensionMetaJsonPath,
                refreshType: 'set',
                projectMeta: projectMetaJson
            });
    }
};

interface RefreshI18nConfigJsonOptions {
    refreshType?: 'read' | 'set',
    projectMeta?: ProjectMetaJson,
    runTimeConfigPath?: string,
    isSave?: boolean
};

/** 刷新全局国际化配置 */
export async function refreshI18nConfigJson(context: ExtensionContext, options: RefreshI18nConfigJsonOptions) {
    try {
        let {
            refreshType,
            projectMeta,
            runTimeConfigPath = await getRunTimeConfigPath(context),
            isSave,
        }: RefreshI18nConfigJsonOptions = {
            refreshType: 'read',
            isSave: true,
            ...options,
        };
        let metaJson: ProjectMetaJson;

        const isWrite = projectMeta && refreshType === 'set';

        if (isWrite) {
            metaJson = projectMeta!;
        } else {
            metaJson = await readConfigJson(context);
        }

        if (isSave) {
            await saveJsonFile(runTimeConfigPath, { ...metaJson, runTimeVersion: metaJson.runTimeVersion + 1 });
        }

        GlobalExtensionSubject.next(metaJson);
        return metaJson;
    } catch (err) {
        GlobalExtensionSubject.error(err);
    } finally {
        console.log('finish refresh');
    };
};


export const GlobalExtensionSubscription = GlobalExtensionSubject.subscribe({
    next: console.log,
    error: console.error,
});