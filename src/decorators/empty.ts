import isEmpty from "lodash/isEmpty";
import { isPromise } from "util/types";

import type { MethodDecoratorFix } from "types/util";
import { emptyWarningHandler } from "utils/log";

/**
 * 空异常返回
 * @param emptyErrorMsg
 */
export const emptyReturnError = <F extends (...args: any[]) => any>(
  emptyErrorMsg: string
): MethodDecoratorFix<F> => {
  return function (target, propertKey, describor) {
    const originMethod = describor.value!;
    describor.value = function (this: any, ...args: any[]) {
      const result: unknown = originMethod.apply(this, args);
      if (isPromise(result)) {
        return new Promise((resolve, reject) => {
          result
            .then((r) => {
              if (isEmpty(r)) {
                reject(
                  emptyWarningHandler(emptyErrorMsg, {
                    isDefaultMessage: false,
                    isThrow: false,
                  })
                );
              }
            })
            .catch(reject);
        });
      }
      if (isEmpty(result)) {
        emptyWarningHandler(emptyErrorMsg, {
          isDefaultMessage: false,
          isThrow: true,
        });
      }
      return result;
    } as F;
  };
};
