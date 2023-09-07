/** 去除无意义文本并判断字符串是否相等 */
export const isSameTrimString = (str1: string, str2: string): boolean => {
  const format =  (str: string) => str.replace(/\s/g,'');
  return format(str1) === format(str2);
}; 