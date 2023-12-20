import { existsSync } from "fs";
import { unlink } from "fs/promises";
import cloneDeep from "lodash/cloneDeep";
import intersection from "lodash/intersection";
import union from "lodash/union";
import { getGlobalConfiguration, refreshI18nConfigJson } from "utils/conf";
import { ExtensionContext } from "vscode";

/** 扫描国际内容，移除无效的配置 */
export const rescanI18nFileContentJson = async (context: ExtensionContext) => {
  const globalConfig = await getGlobalConfiguration();
  const { isOpenCheckDir, i18nDirList, i18nRuleDirList } =
    cloneDeep(globalConfig);

  let nextDirList = i18nDirList,
    nextI18nRuleDirList = i18nRuleDirList;
  let isWrite = false;

  if (!isOpenCheckDir) {
    return;
  }

  const pathCheckNoExists = union(
    i18nDirList.flatMap((item) => [
      item.originalPath,
      item.targetPath,
      item.projectPath,
    ]),
    i18nRuleDirList.flatMap((item) => [
      item.i18nDirPath,
      item.projectPath,
      item.rulePath,
    ])
  )
    .map((path) => ({ path, isExist: existsSync(path) }))
    .filter((item) => !item.isExist)
    .map((item) => item.path);
  // 存在可移除文件
  if (pathCheckNoExists.length > 0) {
    isWrite = true;

    const requireRemoveDirList = i18nDirList.filter((item) =>
      intersection(
        [item.originalPath, item.targetPath, item.projectPath],
        pathCheckNoExists
      )
    );
    // 移除无效目录文件
    nextDirList = i18nDirList.filter(
      (item) =>
        !intersection(
          [item.originalPath, item.targetPath, item.projectPath],
          pathCheckNoExists
        )
    );
    nextI18nRuleDirList = i18nRuleDirList.filter(
      (item) =>
        !requireRemoveDirList.find(
          (removeDirItem) =>
            removeDirItem.projectPath === item.projectPath ||
            removeDirItem.originalPath === item.i18nDirPath
        )
    );
    // 删除运行时临时配置
    await Promise.allSettled(
      requireRemoveDirList.map((removeDirItem) =>
        unlink(removeDirItem.targetPath)
      )
    );
  }

  if (isWrite) {
    await refreshI18nConfigJson(context, {
      projectConf: {
        ...globalConfig,
        i18nDirList: nextDirList,
        i18nRuleDirList: nextI18nRuleDirList,
      },
      isSave: true,
      refreshType: "set",
    });
  }
};
