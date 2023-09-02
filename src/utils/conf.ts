import type { ExtensionContext, Uri } from 'vscode';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';
import { ProjectMetaJson, i18nDirItem, XTextEditor } from "types/index";
import { readJsonFile, saveJsonFile } from "utils/fs";
import { getWrokspaceFloder, getRunTimeConfigPath } from "utils/path";

/** 全局发布订阅中心 */
export const GlobalExtensionSubject= new AsyncSubject<ProjectMetaJson>();

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

        await saveJsonFile(extensionMetaJsonPath, projectMetaJson);

        GlobalExtensionSubject.next(projectMetaJson);
    }
};