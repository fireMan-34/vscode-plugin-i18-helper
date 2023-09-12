import { 
  window, 
  TreeItem, 
  TreeItemCollapsibleState, 
  Disposable, 
  EventEmitter, } from 'vscode';
import type { 
  ExtensionContext, 
  ProviderResult, 
  TreeDataProvider, } from 'vscode';
import { relative } from 'path';
import { VIEW_ID_MAP } from 'constants/index';
import { getGlobalConfiguration, GlobalExtensionSubject, GlobalExtensionSubscription } from 'utils/conf';
import { isSamePath, isSubPath } from 'utils/path';
import { getWrokspaceFloder } from 'utils/path.code';
import { getSubDirectoryFromDirectoryPath } from 'utils/fs';
import { I18nDirViewItem } from 'types/index';

/**
 * 国际化目录操作视图
 * 😢官方好像不支持这么菜单处理， 头疼
 * @link https://qa.1r1g.com/sf/ask/3555182431/
 * @link https://github.com/microsoft/vscode/issues/26948
 * @link https://stackoverflow.com/search?q=vscode+TreeDataProvider+command
 */
class I18nMapDirDataProvider implements TreeDataProvider<I18nDirViewItem> {

  refreshEM = new EventEmitter<void | I18nDirViewItem | I18nDirViewItem[] | null | undefined>();

  refresh() { this.refreshEM.fire(); }

  disposeEM = new Disposable(() => this.refreshEM.dispose());

  /** 
    这个 api 应该是用来刷新视图，头疼
   * @link https://stackoverflow.com/questions/52421724/how-to-refresh-treeview-on-underlying-data-change
   * @link https://stackoverflow.com/questions/56859900/command-on-treeviewitem-item-click-vscode-extension/74061006#74061006
   */
  get onDidChangeTreeData() {
    return this.refreshEM.event;
  };


  async getChildren(element?: I18nDirViewItem | undefined): Promise<I18nDirViewItem[] | undefined> {
    try {
      const isRoot = !element;
      if (isRoot) {
        const { i18nDirList } = await getGlobalConfiguration();
        const curWorkspaceFolder = await getWrokspaceFloder({ multiplySelect: 'default' });
        const rootPath = curWorkspaceFolder.uri.fsPath;

        const i18nDirViews = (await Promise.all(i18nDirList
          .filter((item => isSamePath(item.projectPath, rootPath)))
          .map((dir) => dir.originalPath)
          .map(getSubDirectoryFromDirectoryPath)
        )).flatMap(paths => paths.map(path => ({ path })));

        return i18nDirViews;
      }

      const paths = await getSubDirectoryFromDirectoryPath(element.path);
      return paths.map(path => ({ path, parent: element }));
    } catch (err) {
      console.log(err);
    }

  }

  async getTreeItem(element: I18nDirViewItem): Promise<TreeItem> {

    const rootPath = await (async function () {
      if (element.parent) {
        return element.parent.path;
      }
      const curWorkspaceFolder = await getWrokspaceFloder({ multiplySelect: 'default' });
      const { i18nDirList } = await getGlobalConfiguration();
      const [curI18nDir] = i18nDirList
        .filter(item => isSamePath(item.projectPath, curWorkspaceFolder.uri.fsPath))
        .filter(item => isSubPath(item.originalPath, element.path) || isSamePath(item.originalPath, element.path));
      return curI18nDir.projectPath;
    }());

    const treeItem = new TreeItem({
      label: relative(rootPath, element.path),
    });

    treeItem.id = element.path;
    treeItem.description = '国际化扫描目录, 这里提供处理国际化文本消费的操作功能';
    treeItem.tooltip = element.path;
    // treeItem.command= {
    //   title: '打开 webview 视图',
    //   command: 'i18n.openWebView',
    // };
    treeItem.contextValue = 'i18n.dir';
    treeItem.collapsibleState = ((await getSubDirectoryFromDirectoryPath(element.path)).length > 0)
      ? TreeItemCollapsibleState.Collapsed
      : TreeItemCollapsibleState.None;
    // 命令标记
    // treeItem.contextValue
    // ? https://w3c.github.io/aria/#widget_roles
    // treeItem.accessibilityInformation
    return treeItem;
  }

  getParent(element: I18nDirViewItem): ProviderResult<I18nDirViewItem> {
    return element.parent;
  }
}

export const i18nMapDirDataProvider = new I18nMapDirDataProvider();
const providerDispose = window.registerTreeDataProvider(VIEW_ID_MAP.DIR, i18nMapDirDataProvider);

/** 视图实例 */
export const i18nMapDirTreeView = window.createTreeView(VIEW_ID_MAP.DIR, {
  treeDataProvider: i18nMapDirDataProvider,
});

const refreshViewSubjection = GlobalExtensionSubject.subscribe({
  next(value) {
    if (value.i18nDirList.length > 0) {
      i18nMapDirDataProvider.refresh();
    }
  },
});
GlobalExtensionSubscription.add(refreshViewSubjection);

export const createTreeI18nMapDirProvider = (context: ExtensionContext) => {

  return new Disposable(() => {
    providerDispose.dispose();
    i18nMapDirTreeView.dispose();
    i18nMapDirDataProvider.disposeEM.dispose();
  });
};