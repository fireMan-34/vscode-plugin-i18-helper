import { I18nType, I18nDescriptionItem, I18nMetaJson, ProjectSaveConfig } from 'types/index';

type I18nDescriptionMap = Record<I18nType, I18nDescriptionItem>;

export const I18N_DESCRIPTION_MAP: I18nDescriptionMap = {
  [I18nType.EN_US]: {
    lang: I18nType.EN_US,
    dir: I18nType[I18nType.EN_US],
    name: '英文',
  },
  [I18nType.JA_JP]: {
    lang: I18nType.JA_JP,
    dir: I18nType[I18nType.JA_JP],
    name: '日文',
  },
  [I18nType.ZH_CN]: {
    lang: I18nType.ZH_CN,
    dir: I18nType[I18nType.ZH_CN],
    name: '中文简体',
  },
  [I18nType.ZH_HK]: {
    lang: I18nType.ZH_HK,
    dir: I18nType[I18nType.ZH_HK],
    name: '中文繁体',
  },
  [I18nType.KO_KR]: {
    lang: I18nType.KO_KR,
    dir: I18nType[I18nType.KO_KR],
    name: '韩文',
  },
  [I18nType.UN_KNOWN]: {
    lang: I18nType.UN_KNOWN,
    dir: I18nType[I18nType.UN_KNOWN],
    name: '未知',
  }
};

export const I18N_ENTRY_ENUM_VALUE: readonly I18nType[] = [ 
  I18nType.ZH_CN,
  I18nType.ZH_HK,
  I18nType.EN_US,
  I18nType.JA_JP,
  I18nType.KO_KR,
  I18nType.UN_KNOWN,
];

/** 默认国际化保存文本 meta 类型 */
export const DEFAULT_I18N_META: I18nMetaJson = {
  default: {
  },
  saveContent: {
    [I18nType.EN_US]: [],
    [I18nType.JA_JP]: [],
    [I18nType.KO_KR]: [],
    [I18nType.UN_KNOWN]: [],
    [I18nType.ZH_CN]: [],
    [I18nType.ZH_HK]: [],
  }
};

/** 默认国际化文件配置 */
export const PROJECT_META_JSON: ProjectSaveConfig = {
  runTimeVersion: 1,
  i18nDirList: [],
  i18nRuleDirList: [],
};

/** vscode 配置 Map */
export const VSCODE_KEYS_MAP = {
  isOpenCheckDir: 'isOpenCheckDir',
  mainLanguage: 'mainLanguage',
  scanFolders: 'scanFolders',
  generateTemplate: 'generateTemplate',
  generateTemplates: 'generateTemplates',
  fastTranslateLanguageType: 'fastTranslateLanguageType',
  translateEngine: 'translateEngine',
  generatedCodeFromStrMode: "generatedCodeFromStrMode",
} as const;

/** vscode 配置 */
export const VSCODE_KEYS = [
  VSCODE_KEYS_MAP.isOpenCheckDir,
  VSCODE_KEYS_MAP.mainLanguage,
  VSCODE_KEYS_MAP.scanFolders,
  VSCODE_KEYS_MAP.generateTemplate,
  VSCODE_KEYS_MAP.generateTemplates,
  VSCODE_KEYS_MAP.fastTranslateLanguageType,
  VSCODE_KEYS_MAP.translateEngine,
  VSCODE_KEYS_MAP.generatedCodeFromStrMode,
];