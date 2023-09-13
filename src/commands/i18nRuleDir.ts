import isEmpty from 'lodash/isEmpty';
import { CMD_KEY  } from 'constants/index';
import { getI18nDirViewItem } from 'providers/i18nMapDir';
import { ICommondItem } from 'types/index';

const i18nRuleDir: ICommondItem = {
    cmd: CMD_KEY.I18N_RULE_DIR_SET,
    cmdExcuter(context, textEditor, edit, ...args) {
        const [ selection ] = getI18nDirViewItem();
        if (isEmpty(selection)) {
            return;
        }
        console.log(selection);
    },
};

export default i18nRuleDir;