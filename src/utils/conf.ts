import { ExtensionContext, Uri, workspace } from 'vscode';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { ProjectSaveConfig, VScodeConfig, ProjectGlobalConfig, I18nDirItem, XTextEditor } from "types/index";
import { readJsonFile, saveJsonFile } from "utils/fs";
import { getRunTimeConfigPath } from "utils/path";
import { getWrokspaceFloder } from 'utils/path.code';
import { PROJECT_META_JSON, EXTENSION_NAME, VSCODE_KEYS } from 'constants/index';

/** 获取插件全局保存配置 */
export const getSaveJsonConfig = async (context: ExtensionContext): Promise<ProjectSaveConfig> => {
    /** 全局插件 元信息位置 */
    const extensionMetaJsonPath = await getRunTimeConfigPath(context);
    const saveJsonConfig = await readJsonFile<ProjectSaveConfig>(extensionMetaJsonPath);
    return saveJsonConfig;
};

/** 获取 vscode 配置 */
export const getVScodeConfig = (): VScodeConfig => {
    return pick(workspace.getConfiguration(EXTENSION_NAME), VSCODE_KEYS) as VScodeConfig;
};

/** 获取初始默认全局配置 */
export const readGlobalInitConfiguration = (): ProjectGlobalConfig => {
    const saveDefaultJson = cloneDeep(PROJECT_META_JSON);
    const VScodeConfig = getVScodeConfig();

    return { ...saveDefaultJson, ...VScodeConfig };
};

/** 全局发布订阅中心 */
export const GlobalExtensionSubject = new BehaviorSubject<ProjectGlobalConfig>(readGlobalInitConfiguration());

/** 读取国际化全局配置 国际化信息 */
export async function readConfigJson(context: ExtensionContext): Promise<ProjectGlobalConfig> {
    const refreshReadConfig = {
        ...await getSaveJsonConfig(context),
        ...getVScodeConfig(),
    };
    return refreshReadConfig;
};

/** 写入国际化全局配置 国际化信息 */
export async function writeI18nConfigJson(context: ExtensionContext, excuter: XTextEditor | Uri, saveJsonPath: string) {
    /** 全局插件 元信息位置 */
    const extensionMetaJsonPath = await getRunTimeConfigPath(context);
    /** 执行路径 */
    const excutePath = excuter.fsPath;

    const projectSaveJson = await readJsonFile<ProjectSaveConfig>(extensionMetaJsonPath);
    const projectPath = await getWrokspaceFloder({
        multiplySelect: 'matchI18n',
        matchI18nPath: excutePath,
    });
    const item: I18nDirItem = {
        originalPath: excutePath,
        targetPath: saveJsonPath,
        projectPath: projectPath.uri.fsPath,
    };

    if (!projectSaveJson.i18nDirList.find(dirItem =>
        dirItem.originalPath === item.originalPath
        && dirItem.targetPath === item.targetPath
    )) {
        projectSaveJson.i18nDirList.push(item);
        projectSaveJson.runTimeVersion += 1;
        await refreshI18nConfigJson(context,
            {
                runTimeConfigPath: extensionMetaJsonPath,
                refreshType: 'set',
                projectConf: {
                    ...projectSaveJson,
                    ...getVScodeConfig(),
                },
            });
    }
};

interface RefreshI18nConfigJsonOptions {
    refreshType?: 'read' | 'set',
    projectConf?: ProjectGlobalConfig,
    runTimeConfigPath?: string,
    isSave?: boolean
};

/** 刷新全局国际化配置 */
export async function refreshI18nConfigJson(context: ExtensionContext, options: RefreshI18nConfigJsonOptions) {
    try {
        let {
            refreshType,
            projectConf,
            runTimeConfigPath = await getRunTimeConfigPath(context),
            isSave,
        }: RefreshI18nConfigJsonOptions = {
            refreshType: 'read',
            isSave: true,
            ...options,
        };
        const isWrite = projectConf && refreshType === 'set';

        let globalConfig: ProjectGlobalConfig;

        if (isWrite) {
            globalConfig = projectConf!;
        } else {
            globalConfig = await readConfigJson(context);
        }

        const projectSaveConfig = omit(globalConfig, VSCODE_KEYS) as ProjectSaveConfig;

        if (isSave) {
            projectSaveConfig.runTimeVersion += 1;
            await saveJsonFile(runTimeConfigPath, projectSaveConfig);
        }

        GlobalExtensionSubject.next(globalConfig);
        return globalConfig;
    } catch (err) {
        GlobalExtensionSubject.error(err);
    } finally {
    };
};


export const GlobalExtensionSubscription = GlobalExtensionSubject.subscribe({
    error: console.error,
});

export const getGlobalConfiguration = () => {
    return firstValueFrom(GlobalExtensionSubject.pipe(first(conf => !!conf.i18nDirList.length)));
};

/** 强制更新全局数据 一般是 db 层变动又以全局config 做 cache 代码做强制更新 */
export const refreshSlientGlobalConfiguration = () => {
    return GlobalExtensionSubject.next({
        ...GlobalExtensionSubject.value,
        runTimeVersion: GlobalExtensionSubject.value.runTimeVersion + 1,
    });
};