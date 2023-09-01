/**
 *  @see https://juejin.cn/post/7078219615033098271?searchId=2023090110302436458B3E6094BC89A8F1
 *  */
declare module 'chinese-conv' {
  
  /** 转换成简体 */
  export const sify: (text: string) => string;
  /** 转换成繁体 */  
  export const tify: (text: string) => string;

}

