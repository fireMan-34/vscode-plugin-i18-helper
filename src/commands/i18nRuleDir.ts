import { window, type QuickPickItem, ExtensionContext } from "vscode";
import isEmpty from "lodash/isEmpty";
import { CMD_KEY } from "constants/index";
import { getI18nDirViewItem } from "providers/i18nMapDir";
import { thorwNewError } from "utils/log";
import { getGlobalConfiguration, refreshI18nConfigJson } from "utils/conf";
import { isSamePath } from "utils/path";
import { I18N_DESCRIPTION_MAP, I18N_ENTRY_ENUM_VALUE } from "constants/index";
import {
  ICommondItem,
  I18nDirViewItem,
  I18nTypeKey,
  ProjectGlobalConfig,
  MethodDecoratorFix,
} from "types/index";

/** 检测视图目录是否为空 */
export const isEmptySelection: MethodDecoratorFix<() => I18nDirViewItem> = (
  target,
  propKey,
  descriptor
) => {
  const originalMethod = descriptor.value!;
  descriptor.value = function () {
    const selection = originalMethod.apply(this, );
    if (isEmpty(selection)) {
      throw new Error("请选择需要操作的目录");
    }
    return selection;
  };
};

/** 检测是否选中国际化类型供设置 */
export const unQuickI18nType: MethodDecoratorFix<() => Promise<I18nTypeKey>> = (
  target,
  propertyKey,
  describtor
) => {
  const originalMethod = describtor.value!;
  describtor.value = async function () {
    const result = await originalMethod.apply(this);
    if (isEmpty(result)) {
      throw new Error("请选择目录要设定的国际化类型");
    }
    return result;
  };
};

export const showCatchAsyncError: MethodDecoratorFix<
  (...args: any) => Promise<void>
> = (target, propertyKey, describtor) => {
  const originalMethod = describtor.value!;
  describtor.value = async function (...args: any) {
    try {
      await originalMethod.apply(this, args);
    } catch (error) {
      if (typeof error === "string") {
        thorwNewError(error, TypeError);
      } else {
        console.error(error);
      }
    }
  };
};

class I18nRuleDir implements ICommondItem {
  cmd = CMD_KEY.I18N_RULE_DIR_SET;
  @showCatchAsyncError
  async cmdExcuter(context: ExtensionContext) {
    const selection = this.getSelection();
    const i18nTyeKey = await this.getI18nRuleTypeFromQuickPick();
    const globalConfig = await getGlobalConfiguration();
    const nextI18nRuleDirList = await this.getNewI18nRuleDirList(
      globalConfig,
      selection,
      i18nTyeKey
    );
    await refreshI18nConfigJson(context, {
      refreshType: "set",
      projectConf: {
        ...globalConfig,
        i18nRuleDirList: nextI18nRuleDirList,
      },
    });
  }

  /** 获取选中的目录 */
  @isEmptySelection
  getSelection() {
    return getI18nDirViewItem()[0];
  }

  /** 获取可选的国际化类型供设置 */
  @unQuickI18nType
  async getI18nRuleTypeFromQuickPick() {
    const i18nTypeQuickItems: QuickPickItem[] = I18N_ENTRY_ENUM_VALUE.map(
      (val) => I18N_DESCRIPTION_MAP[val]
    ).map((item) => ({
      label: item.name,
      description: `${item.name} ${item.dir}`,
      detail: item.dir,
    }));
    const i18nTypeQuickItem = await window.showQuickPick(i18nTypeQuickItems);
    return i18nTypeQuickItem?.detail as unknown as I18nTypeKey;
  }

  /** 获取新的国际化类型 */
  getNewI18nRuleDirList(
    globalConfig: ProjectGlobalConfig,
    selection: I18nDirViewItem,
    i18nType: I18nTypeKey
  ) {
    const { i18nRuleDirList } = globalConfig;
    const i18nRuleDirItem = {
      i18nType,
      i18nDirPath: selection.root!.path,
      rulePath: selection.path,
      projectPath: selection.projectPath,
    };
    const nextI18nRuleDirList = [...i18nRuleDirList];
    const ruleDirIndex = i18nRuleDirList.findIndex((ruleItem) =>
      isSamePath(ruleItem.rulePath, selection.path)
    );
    const hasRuleDirItem = ruleDirIndex > -1;
    if (hasRuleDirItem) {
      nextI18nRuleDirList[ruleDirIndex] = i18nRuleDirItem;
    } else {
      nextI18nRuleDirList.push(i18nRuleDirItem);
    }
    return nextI18nRuleDirList;
  }
}

/**
 * @name 扫描目录规则
 * 添加国际化类型用于解析相应的字符串
 */
const i18nRuleDir: ICommondItem = new I18nRuleDir();

export default i18nRuleDir;
