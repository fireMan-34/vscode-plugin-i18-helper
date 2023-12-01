/**
 * 调整输入数字到指定大小范围内
 * @param input 输入数值
 * @param min 允许的最小值
 * @param max 允许的最大值
 * @returns 调整后的数值
 */
export const adjustNumberRange = (input: number, min: number, max: number,) => {
    return Math.min(Math.max(min, input), max);
};