import { window, type QuickPickItem } from 'vscode';
import isEmpty from 'lodash/isEmpty';
import { CMD_KEY } from 'constants/index';
import { getI18nDirViewItem } from 'providers/i18nMapDir';
import { emptyWarningHandler } from 'utils/log';
import { getGlobalConfiguration, refreshI18nConfigJson } from 'utils/conf';
import { isSamePath } from 'utils/path';
import { I18N_DESCRIPTION_MAP, I18N_ENTRY_ENUM_VALUE } from 'constants/index';
import { ICommondItem, I18nType, I18nRuleDirItem } from 'types/index';

/**
 * @name 扫描目录规则
 * 添加国际化类型用于解析相应的字符串
 */
const i18nRuleDir: ICommondItem = {
    cmd: CMD_KEY.I18N_RULE_DIR_SET,
    async cmdExcuter(context, textEditor, edit, ...args) {
        const [selection] = getI18nDirViewItem();
        if (isEmpty(selection)) {
            emptyWarningHandler('选中目录');
            return;
        }
        const globalConfig = await getGlobalConfiguration();
        const { i18nRuleDirList } = globalConfig;


        const i18nTypeQuickItems: QuickPickItem[] = I18N_ENTRY_ENUM_VALUE
            .map(val => I18N_DESCRIPTION_MAP[val])
            .map((item) => ({
                label: item.name,
                description: `${item.name} ${item.dir}`,
                detail: item.dir,
            }));
        const i18nTypeQuickItem = await window.showQuickPick(i18nTypeQuickItems);
        if (isEmpty(i18nTypeQuickItem)) {
            emptyWarningHandler('指定国际化类型');
            return;
        }


        const i18nType = i18nTypeQuickItem.detail as keyof typeof I18nType;
        const i18nRuleDirItem: I18nRuleDirItem = {
            i18nType,
            i18nDirPath: selection.root!.path,
            rulePath: selection.path,
            projectPath: selection.projectPath,
        };

        const nextI18nRuleDirList = [...i18nRuleDirList];
        const ruleDirIndex = i18nRuleDirList.findIndex(ruleItem => isSamePath(ruleItem.rulePath, selection.path));
        const hasRuleDirItem = ruleDirIndex > -1;
        if (hasRuleDirItem) {
            nextI18nRuleDirList[ruleDirIndex] = i18nRuleDirItem;
        } else {
            nextI18nRuleDirList.push(i18nRuleDirItem);
        }

        await refreshI18nConfigJson(context, {
            refreshType: 'set',
            projectConf: {
                ...globalConfig,
                i18nRuleDirList: nextI18nRuleDirList,
            },
        });

    },
};

export default i18nRuleDir;