import type {
  CancellationToken,
  WebviewView,
  WebviewViewResolveContext,
  WebviewViewProvider,
  ExtensionContext,
} from "vscode";
import { window, EventEmitter } from "vscode";

import { getGlobalConfiguration } from "utils/conf";
import { VIEW_ID_MAP } from "constants/index";
import { ProjectGlobalConfig } from "types/conf";
import { getWrokspaceFloder } from "utils/path.code";
import { getRuntimePath, isSamePath } from "utils/path";

class I18nMapConfigWebview implements WebviewViewProvider {
  refreshEM = new EventEmitter<ProjectGlobalConfig>();

  constructor(public context: ExtensionContext) {}

  async refresh(conf?: ProjectGlobalConfig) {
    const config = conf ?? (await getGlobalConfiguration());
    this.refreshEM.fire(config);
  }

  async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ) {
    const workspaceFolder = await getWrokspaceFloder({
      multiplySelect: "default",
    });
    if (!workspaceFolder) {
      return;
    }
    const runtimePath = await getRuntimePath(this.context);
    if (!runtimePath) {
      return;
    }
    const projectPath = workspaceFolder.uri.fsPath;
    const { mainLanguage, i18nDirList } = await getGlobalConfiguration();
    const curretnI18nDirList = i18nDirList.filter((item) =>
      isSamePath(item.projectPath, projectPath)
    );

    const localString = curretnI18nDirList
      .map(
        (item) =>
          `<p>多语言文件夹 ----> <a href="${item.originalPath}" title="${item.targetPath}">${item.originalPath}</a></p>`
      )
      .join();

    webviewView.title = "国际化插件配置";
    webviewView.description = "提供国际化插件配置状态。";
    webviewView.badge = {
      tooltip: "工具栏提示",
      value: 1,
    };
    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };
    webviewView.webview.html = `
      <script src="https://cdn.tailwindcss.com"></script>
      <h3 class="my-2 font-bold underline text-red-100">
          Use Tailwind WebView!
      </h3>
      <p>项目配置路径 ----> <a href="${runtimePath}" >${runtimePath}</a></p>
      <p>项目文件夹 ----> <a href="${projectPath}">${projectPath}</a></p>
      ${localString}
    `;
  }
}

export const createI18nMapConfig = (context: ExtensionContext) => {
  return window.registerWebviewViewProvider(
    VIEW_ID_MAP.CONF,
    new I18nMapConfigWebview(context)
  );
};
