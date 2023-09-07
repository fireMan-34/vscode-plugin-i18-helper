/** 去除无意义文本并判断字符串是否相等 */
export const isSameTrimString = (str1: string, str2: string): boolean => {
  const format =  (str: string) => str.replace(/\s/g,'');
  return format(str1) === format(str2);
}; 

export const findStartAndEndIndex = (str: string ,search: string): [ number, number ] | undefined => {
  const startIndex = str.indexOf(search);
  if (startIndex !== -1) {
    return [ startIndex, startIndex + search.length - 1]
  }
  return void 0;
};