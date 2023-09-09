import isEmpty from "lodash/isEmpty";
import { normalize } from "path";
import { type WorkspaceFolder, workspace, window, Uri } from "vscode";
import { thorwNewError } from "utils/log";
import { isSubPath, getPathSameVal } from "utils/path";

/** 检测 workfloder 是否不满足条件
 * 如果满足返回非空值类型
 */
export function checkWrokFloders(workspaceFolders: readonly WorkspaceFolder[] | undefined): readonly WorkspaceFolder[] {
    if (!workspaceFolders) {
      throw new Error('请添加文件夹到当前工作区');
    }
    return workspaceFolders;
  };
  
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
      thorwNewError('当前工作区匹配不到此路径', RangeError);
    };
  
    const workspaceMatchFolder = workspaceFolders
      .map((item => ({ item, normailzePath: normalize(item.uri.fsPath) })))
      .map((item) => ({ ...item, sameVal: getPathSameVal(normalizeI18nPath, item.normailzePath) }))
      .reduce((acc, item) => acc.sameVal > item.sameVal ? acc : item ).item;
    return workspaceMatchFolder;
  }
  
  interface GetWrokspaceFloderOptions {
    /** 用户选择模式 , 首个模式  */
    multiplySelect?: 'pick' | 'default' | 'matchI18n' | 'matchFile',
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
      const workspaceFolder =  workspace.getWorkspaceFolder(matchUri);
      if (workspaceFolder) {
        return workspaceFolder;
      };
    }
  
    return pickWrokspaceFolder();
  
  }