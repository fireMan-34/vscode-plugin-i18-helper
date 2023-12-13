import { watch } from "fs";
import debounce from "lodash/debounce";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Subscription } from "rxjs/internal/Subscription";
import { getGlobalConfiguration } from "utils/conf";
import { isSamePath } from "utils/path";
import { getWrokspaceFloder } from "utils/path.code";
import { Disposable, ExtensionContext, workspace, Uri, commands } from "vscode";
import { CMD_KEY } from "constants/index";

const watchFilesSubject = new BehaviorSubject({ isInit: true, version: 0 });
const watchFileSubscription = new Subscription();

/** 初始扫描当前目录国际化内容
 *
 */
export const initScanCurrentLocals = async (context: ExtensionContext) => {
  if (!workspace.workspaceFolders) {
    return;
  }
  const { i18nDirList } = await getGlobalConfiguration();

  const worksoaceFolderPaths = workspace.workspaceFolders!.map(
    (folder) => folder.uri.fsPath
  );

  const curI18nDirList = i18nDirList.filter((i18nDir) =>
    worksoaceFolderPaths.some((folderPath) =>
      isSamePath(i18nDir.projectPath, folderPath)
    )
  );

  const localUris = curI18nDirList.map((i18nDir) =>
    Uri.file(i18nDir.originalPath)
  );

  await Promise.all(
    localUris.map((uri) => commands.executeCommand(CMD_KEY.SCAN_I18_FILE, uri))
  );
};

export const refreshI18nDb = async (context: ExtensionContext) => {
  const workfolder = await getWrokspaceFloder({ multiplySelect: "default" });
  const { i18nDirList } = await getGlobalConfiguration();
  const watchers = i18nDirList
    .filter((item) => isSamePath(item.projectPath, workfolder.uri.fsPath))
    .map((item) => item.originalPath)
    .map((dirPath) => watch(dirPath, { recursive: true }));

  watchFileSubscription.add(() => watchers.forEach((w) => w.close()));
  watchers.forEach((w) =>
    w.on(
      "change",
      debounce(
        () =>
          watchFilesSubject.next({
            isInit: false,
            version: watchFilesSubject.value.version + 1,
          }),
        3000
      )
    )
  );
  watchFileSubscription.add(
    watchFilesSubject.subscribe((ev) => {
      if (ev.isInit) {
        return;
      }
      console.log("文件已更新", ev.version);
    })
  );

  context.subscriptions.push(
    new Disposable(() => watchFileSubscription.unsubscribe())
  );
};
