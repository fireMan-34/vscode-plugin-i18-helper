import type {
  CancellationToken,
  WebviewView,
  WebviewViewResolveContext,
  WebviewViewProvider,
  ExtensionContext,
} from "vscode";
import { window, EventEmitter, Uri } from "vscode";

import { getGlobalConfiguration } from "utils/conf";
import { VIEW_ID_MAP } from "constants/index";
import { ProjectGlobalConfig } from "types/conf";
import { getWrokspaceFloder } from "utils/path.code";
import { getRuntimePath, isSamePath } from "utils/path";

class I18nMapConfigWebview implements WebviewViewProvider {
  refreshEM = new EventEmitter<ProjectGlobalConfig>();

  constructor(public context: ExtensionContext) { }

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
    const { i18nDirList } = await getGlobalConfiguration();
    const curretnI18nDirList = i18nDirList.filter((item) =>
      isSamePath(item.projectPath, projectPath)
    );
    const renderUrlConfig = (props: {
      label: string,
      message: string,
      href: string
    }) => {
      const { label, message, href } = props;
      return `<p><span class="text-white font-bold text-sm" >${label}</span> : <a class="text-gray-300 font-light text-xs"  href="${href}" >${message}</a></p>`;
    };
    const localString = curretnI18nDirList
      .map(
        (item) =>
          `<p><span class="text-white font-bold text-sm">多语言文件夹<span> : <a class="text-gray-300 font-light text-xs" href="${item.originalPath}" title="${"生成配置路径：" + item.targetPath}">国际化关联目录：${item.originalPath}</a></p>`
      )
      .join();

    const tailwindcssFilePath = webviewView.webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, 'src', 'media', 'tailwindcss.js'));
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
      <script src="${tailwindcssFilePath}"></script>
      <h3 class="my-2 font-bold underline text-red-100">
          Use Tailwind WebView!
      </h3>
      ${renderUrlConfig({
      label: "项目配置路径",
      message: runtimePath,
      href: runtimePath,
    })}
      ${renderUrlConfig({
      label: "项目文件夹",
      message: projectPath,
      href: projectPath,
    })}
    ${renderUrlConfig({
      label: "插件安装路径",
      message: this.context.extensionPath,
      href: this.context.extensionPath,
    })}
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
