import isEmpty from "lodash/isEmpty";
import { normalize } from "path";
import { type WorkspaceFolder, workspace, window, Uri, type TextEditor } from "vscode";
import { thorwNewError } from "utils/log";
import { isSubPath, getPathSameVal } from "utils/path";

/** 检测 workfloder 是否不满足条件
 * 如果满足返回非空值类型
 */
export function checkWrokFloders(workspaceFolders: readonly WorkspaceFolder[] | undefined): readonly WorkspaceFolder[] {
  if (workspaceFolders) {
    return workspaceFolders;
  }

  throw thorwNewError('请添加文件夹到当前工作区', TypeError);
};

export function checkActiveEditor(editor: TextEditor | undefined) {
  if (editor) {
    return editor;
  }
  throw thorwNewError('当前无编辑文件，无法匹配目录', TypeError);
}

/** 挑选工作目录 */
export function pickWrokspaceFolder(): Thenable<WorkspaceFolder> {
  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders);
  const quickPickFolderPromise = window.showQuickPick(workspaceFolders.map((item => item.name)),
    { placeHolder: '请选择扫描国际化项目目录', ignoreFocusOut: true });
  return quickPickFolderPromise
    .then((workspaceFolderName) => {
      const workfloder = workspaceFolders.find((folder => folder.name === workspaceFolderName));
      if (workfloder) {
        return workfloder;
      }
      throw new Error('找不到工作区间项目目录');
    });
}

/** 匹配相似目录，选取相似度最高的目录 */
export function matchI18nWorkspaceFolder(matchI18nPath: string) {
  const normalizeI18nPath = normalize(matchI18nPath);
  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders)
    .filter((folder) => isSubPath(folder.uri.fsPath, normalizeI18nPath));

  if (isEmpty(workspaceFolders)) {
    throw thorwNewError('当前工作区匹配不到此路径', RangeError);
  };

  const workspaceMatchFolder = workspaceFolders
    .map((item => ({ item, normailzePath: normalize(item.uri.fsPath) })))
    .map((item) => ({ ...item, sameVal: getPathSameVal(normalizeI18nPath, item.normailzePath) }))
    .reduce((acc, item) => acc.sameVal > item.sameVal ? acc : item).item;
  return workspaceMatchFolder;
}

/** 匹配当前活跃的编辑器 */
export function matchActiveFileWorkspaceFolder() {
  const activeTextEditoror = checkActiveEditor(window.activeTextEditor);
  return workspace.getWorkspaceFolder(activeTextEditoror!.document.uri);
};

interface GetWrokspaceFloderOptions {
  /** 用户选择模式 , 首个模式
   * * pick 用户选择工作目录模式
   * * default 默认匹配，会匹配第一个目录
   * * matchI18n 是作者自己实现的目录匹配逻辑
   * * matchFile 是根据 vscode getWrokfolder Api 获取对应的目录
   * * matchActiveFile 匹配当前活跃的编辑器对象对应的目录
    */
  multiplySelect?: 'pick' | 'default' | 'matchI18n' | 'matchFile' | 'matchActiveFile',
  /** 需要匹配的路径国际化路径 */
  matchI18nPath?: string,
  /** match File 模式需要的资源定位 */
  matchPath?: Uri | string,
}

/** 获取激活的 workfloder
 * 
 */
export async function getWrokspaceFloder(options?: GetWrokspaceFloderOptions): Promise<WorkspaceFolder> {

  const { multiplySelect, matchI18nPath, matchPath } = {
    multiplySelect: 'pick',
    ...options,
  } as GetWrokspaceFloderOptions;

  const workspaceFolders = checkWrokFloders(workspace.workspaceFolders);

  const isOnly = workspaceFolders.length === 1;
  if (isOnly || multiplySelect === 'default') {
    return workspaceFolders[0];
  }

  const isUseMatchI18n = multiplySelect === 'matchI18n' && matchI18nPath;
  if (isUseMatchI18n) {
    return matchI18nWorkspaceFolder(matchI18nPath);
  }

  const isMatchFile = multiplySelect === 'matchFile' && matchPath;
  if (isMatchFile) {
    const matchUri = matchPath instanceof Uri ? matchPath : Uri.file(matchPath);
    const workspaceFolder = workspace.getWorkspaceFolder(matchUri);
    if (workspaceFolder) {
      return workspaceFolder;
    };
  }

  const isMatchActiveFile = multiplySelect === 'matchActiveFile';
  if (isMatchActiveFile) {
    const matchI18nWorspaceFolder = matchActiveFileWorkspaceFolder();
    if (matchI18nWorspaceFolder) {
      return matchI18nWorspaceFolder;
    }
  }

  return pickWrokspaceFolder();

}