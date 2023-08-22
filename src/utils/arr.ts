import { range } from 'lodash';

/**
 *创建起始行映射
 *
 * @param {number} start
 * @param {number} end
 * @return {*} 
 */
const rangeFix = (start: number, end: number) => {
	return start === end ? [start] : range(start, end);
};


export {
  rangeFix
};