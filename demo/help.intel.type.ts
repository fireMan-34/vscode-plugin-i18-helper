const o = { 
  'first.i18n.key': 'first.i18n.value',
  'second.i18n.value': 'second.i18n.value',
} as const;

/**
 * same about issue
 * @see https://github.com/microsoft/TypeScript/issues/30581
 * @see https://github.com/microsoft/TypeScript/pull/47109
 * @param key 
 * @param v 
 */
function format<I18nK extends keyof typeof o = keyof typeof o>(key: I18nK, v: typeof o[I18nK]){};

format('first.i18n.key','second.i18n.value');
format('first.i18n.key','first.i18n.value');
