import {
  Uri,
  window
} from "vscode";
import { join } from "path";
import { readDeepDir } from 'utils/fs';
import { CMD_KEY } from 'constants/index';
import { I18nFileItemClass, I18nFileItemUserClass } from 'models/index';
import {
  ICommondItem
} from 'types/index';


/** 扫描国际化文件
 * 命令扫描符合文件目录 生成可使用的数据结构供 国际化插件使用
 * 步骤拆解
 * * 1. 获取扫描 、 插件目录基础信息 - [x]
 * * 2. 获取扫描目录所有文件信息 - [x]
 * * 3. 提取文本对应的国际化文本对象 - [x]
 * * 4. 国际化文本分类 - [x]
 * * 5. 存储国际化文本 - [x]
 * * 6. 存储全局初始化文件配置 - [x]
 * * 7. 全局任务通信 （Rxjs） - [x]
 * * 8. 智能提示 - [x]
 * * 9. 完善读取缓存更新逻辑 - [x]
 * * 10.多项目管理 - [ ]
 * * 11.资源视图管理 - [ ]
 * * 12. vscode 配置支持 - [x] 
 */
const scanI18File: ICommondItem['cmdExcuter'] = async (context, uri: Uri) => {
  const dirPath = uri.fsPath;
  const rootPath = join(dirPath, '..');
  window.showInformationMessage('准备扫描', rootPath, context.extension.extensionPath);
  try {
    I18nFileItemClass.initContext(context);
    const i18nFileItemUserClass = new I18nFileItemUserClass(context, uri);

    window.showInformationMessage('插件根路径', i18nFileItemUserClass.rootPath);

    const { filePaths } = await readDeepDir(dirPath);
    const i18nFileItems = filePaths.map(path => new I18nFileItemClass(path));

    await i18nFileItemUserClass.writeI18nFileContent2Json(i18nFileItems);

  } catch (err) {
    console.error(err);
  }
};
/** 打开界面视图指令
 * @see https://code.visualstudio.com/api/references/activation-events
 */
const item: ICommondItem = {
  cmd: CMD_KEY.SCAN_I18_FILE,
  cmdExcuter: scanI18File,
};
export default item;