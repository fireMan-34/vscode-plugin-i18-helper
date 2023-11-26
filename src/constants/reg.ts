/** 匹配正则
 * @description 键值对后面触发提示
 */
export const FORMAT_MESSAGE_REGEX = /formatMessage\(\{\s*/;
export const FORMAT_MESSAGE_ID_REGEX = /["']?id["']?\s*:\s*["']([^"']*)?["']/;
export const FORMAT_MESSAGE_MSG_REGEX = /("|')?defaultMessage\1?:["']([^"']*)?["']/;
export const FORMAT_MESSAGE_ID_MSG_REGEX = /formatMessage\(\{id:("|')(.*?)\1,defaultMessage:("|')(.*?)\3,?\}\)/g;

export const I18N_T_REGEX = /i18n\.t\(\s*/;
export const I18N_T_KEY_REGEX = /i18n\.t\(\s*["']([^)]*)["']\)/;

export const $_T_REGEX = /t\(\s*/;
export const $_T_KEY_REGEX = /t\(\s*["']([^)]*)["']\)/;