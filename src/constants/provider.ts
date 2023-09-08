import type { DocumentSelector } from 'vscode';

/** 插件支持的文件类型 */
export const SUPPORT_DOCUMENT_SELECTOR: DocumentSelector = [
    { language: 'typescript', scheme: 'file', },
    { language: 'javascript', scheme: 'file', },
    { language: 'typescriptreact', scheme: 'file', },
    { language: 'javascriptreact', scheme: 'file', },
];

/** 生成代码模板类型 */
export const GENERATE_TEMPLATE_MAP = {
    /** formatMessage 渲染国际化 key&val */
    FORMAT_MESSSAGE_WITH_KEY_VAL: "formatMessage({\nid: '${id}',\ndefaultMessage: '${msg}',\n})",
    /** formatMessage 渲染国际化 key */
    FORMAT_MESSAGE_WITH_KEY: "formatMessage({\nid: '${id}',\n})",
    /** formatMessage 渲染国际化 key&val， 添加 intl 前缀 */
    INT_FORMAT_MESSAGE_WITH_KEY_VAL: "intl.formatMessage({\nid: '${id}',\ndefaultMessage: '${msg}',\n})",
    /** formatMessage 渲染国际化 key， 添加 intl 前缀 */
    INT_FORMAT_MESSAGE_WITH_KEY: "intl.formatMessage({\nid: '${id}',\n})",
    /** i18n.t 渲染国际化 key， 添加 intl 前缀 */
    I18N_T_WITH_KEY: "i18n.t('${id}')",
    /** t 渲染国际化 key， 添加 intl 前缀 */
    $T_WITH_KEY: "$t('${id}')",

};

/** 视图映射 ID */
export const VIEW_ID_MAP = {
    DIR: 'i18n-map-dir',
    VIEW: 'i18n-map-view',
    CONF: 'i18n-map-config',
};