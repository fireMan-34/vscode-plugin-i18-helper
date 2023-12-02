import { describe, it } from 'mocha';
import { deepEqual } from 'assert';
import { omit } from 'lodash';
import { PROJECT_META_JSON, VSCODE_KEYS } from 'constants/index';
import { ProjectGlobalConfig, TranslateEngineType, GeneratedCodeFromStrMode,} from 'types/index';

describe('lodash 疑问功能测试', function() {
    it('omit 挑选对象确认', function() {
        const projectConfig: ProjectGlobalConfig = {
            ...PROJECT_META_JSON,
            generateTemplate: '测试',
            isOpenCheckDir: true,
            mainLanguage: 'ZH_HK',
            scanFolders: [ './glob' ],
            fastTranslateLanguageType: [ 'ZH_CN' ],
            translateEngine: TranslateEngineType.baidu,
            generatedCodeFromStrMode: GeneratedCodeFromStrMode.ask,
        };

        deepEqual(omit(projectConfig, VSCODE_KEYS), PROJECT_META_JSON);
    });
});