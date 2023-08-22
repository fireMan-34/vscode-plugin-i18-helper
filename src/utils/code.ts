/** 从键值对字符串·里解析对象
 * @param {string} text 键值对字符串
 * @return {object} 键值对创建的对象
 */
const parseKeyAndValTexts2Object = (text: string): object => {
	const evalCode = `({${text}})`;
	return eval(evalCode);
};

export {
  parseKeyAndValTexts2Object,
};