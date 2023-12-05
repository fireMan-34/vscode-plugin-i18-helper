/**
 * 不变映射
 * 目前用于装饰一些校验变量
 * @param v 变量
 * @returns 
 */
export function noChange <T = unknown >(v: T) { return v; };