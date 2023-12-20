import countBy from "lodash/countBy";
import isEmpty from "lodash/isEmpty";
import { I18nRuleDirItem, I18nType } from "types/conf";
import { I18nFileItem } from "types/modal";
import { getCharsI18nType } from "utils/code";
import { getGlobalConfiguration } from "utils/conf";
import { getPathSameVal, isSubPath } from "utils/path";

/** 默认 文件 utf-8 字符范围频率 判断国际化类型 */
export class BaseFile2I18nTypeClass {
  file: I18nFileItem;

  constructor(file: I18nFileItem) {
    this.file = file;
  }

  isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
    return Promise.resolve(this);
  }

  getI18nType(): Promise<I18nType> {
    const file = this.file;

    return file.parseKeyAndVals.then((record) => {
      const list = Object.values(record);
      const i18nTypes = list.map(getCharsI18nType);
      const countMap = countBy(i18nTypes);
      const i18nType = +Object.entries(countMap).reduce(
        (maxKeyAndVal, curKeyAndVal) =>
          curKeyAndVal[1] > maxKeyAndVal[1] ? curKeyAndVal : maxKeyAndVal,
        [`${I18nType.UN_KNOWN}`, 0]
      )[0] as I18nType;
      return i18nType;
    });
  }
}

/** 根据规则设置判定国际化类型 */
export class RuleDir2I18nTypeClass extends BaseFile2I18nTypeClass {
  suitI18nRuleDirList: I18nRuleDirItem[] = [];

  constructor(file: I18nFileItem) {
    super(file);
  }

  async isThisTransformer(): Promise<BaseFile2I18nTypeClass> {
    const file = this.file;
    const { i18nRuleDirList } = await getGlobalConfiguration();
    this.suitI18nRuleDirList = i18nRuleDirList.filter((dirItem) =>
      isSubPath(dirItem.rulePath, file.path)
    );
    if (isEmpty(this.suitI18nRuleDirList)) {
      return Promise.reject();
    }
    return this;
  }

  async getI18nType(): Promise<I18nType> {
    const i18nDirRuleItem = this.suitI18nRuleDirList
      .map((item) => ({
        item,
        point: getPathSameVal(item.rulePath, this.file.path),
      }))
      .reduce((acc, cur) => {
        if (!acc) {
          return cur;
        }
        return acc.point >= cur.point ? acc : cur;
      }).item;
    return I18nType[i18nDirRuleItem.i18nType];
  }
}