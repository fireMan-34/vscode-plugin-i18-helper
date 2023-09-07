/** 匹配正则
 * @description 键值对后面触发提示
 */
export const FORMAT_MESSAGE_REGEX = /formatMessage\(\{\s*/;
export const FORMAT_MESSAGE_ID_REGEX = /["']?id["']?\s*:\s*["']([^"']*)?["']/;

export const I18N_T_REGEX = /i18n\.t\(\s*/;
export const I18N_T_KEY_REGEX = /i18n\.t\(\s*["']([^)]*)["']\)/;