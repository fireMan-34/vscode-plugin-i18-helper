import { ExtensionContext, window, TreeDataProvider, TreeItem, TreeItemCollapsibleState, ProviderResult, } from 'vscode';
import { relative } from 'path';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { VIEW_ID_MAP } from 'constants/index';
import { GlobalExtensionSubject } from 'utils/conf';
import { isSamePath, isSubPath } from 'utils/path';
import { getWrokspaceFloder } from 'utils/path.code';
import { sleep } from 'utils/asy';
import { getSubDirectoryFromDirectoryPath } from 'utils/fs';
import { I18nDirViewItem } from 'types/index';

/**
 * 国际化目录操作视图
 */
class I18nMapDirDataProvider implements TreeDataProvider<I18nDirViewItem> {

  async getChildren(element?: I18nDirViewItem | undefined): Promise<I18nDirViewItem[] | undefined> {
    try {
      const isRoot = !element;
      if (isRoot) {
        await sleep();

        const { i18nDirList } = await firstValueFrom(GlobalExtensionSubject);
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
      const { i18nDirList } = await firstValueFrom(GlobalExtensionSubject);
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

export const createTreeI18nMapDirProvider = (context: ExtensionContext) => {
  return window.registerTreeDataProvider(
    VIEW_ID_MAP.DIR, i18nMapDirDataProvider);
};