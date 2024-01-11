import { env, window } from "vscode";
import type { ExtensionContext } from "vscode";

import { CMD_KEY } from "constants/index";
import {
  type ICommondItem,
  GeneratedCodeFromStrMode,
} from "types/index";
import { getGlobalConfiguration } from "utils/conf";
import { renderI18nCode } from "utils/code";
import { getWrokspaceFloder } from "utils/path.code";
import { I18nDbPaser } from "models/i18nDbParser";

/** 文本转国际化代码 */
const strToi18nCode = async (
  context: ExtensionContext,
  str: string,
  mode?: GeneratedCodeFromStrMode
) => {
  if (!str) {
    return;
  }
  const globalConfig = await getGlobalConfiguration();
  const { generatedCodeFromStrMode, mainLanguage } = globalConfig;
  const commandMode = mode ?? generatedCodeFromStrMode;
  const workfloder = await getWrokspaceFloder({ multiplySelect: "default" });
  const i18nDbParser = new I18nDbPaser(globalConfig, workfloder);
  await i18nDbParser.prepareCheck();
  if (commandMode === GeneratedCodeFromStrMode.none) {
    return;
  }
  const i18nKeyAndValMap = await i18nDbParser.findKeyOrValue(str);
  const item = i18nKeyAndValMap[mainLanguage];
  if (!item) {
    return;
  }
  if (commandMode === GeneratedCodeFromStrMode.ask) {
    const result = await window.showQuickPick(["是", "否"], {
      title: "检测到可识别的国际化字符串，是否需要帮你转换到剪切板中",
    });
    if (result === "否" || !result) {
      return;
    }
  } else {
    window.showInformationMessage(
      "检测到可识别的国际化字符串，已为你转换成动态模板对应的代码"
    );
  }
  const [id, msg] = item;
  const newCode = renderI18nCode({ id, msg });
  env.clipboard.writeText(newCode);
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: CMD_KEY.STR_TO_I18N_CODE,
  cmdExcuter: strToi18nCode,
};
export default item;
