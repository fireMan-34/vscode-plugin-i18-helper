import { window } from "vscode";
import isEmpty from "lodash/isEmpty";

import { isPromise } from "util/types";

import type {
  MethodDecoratorFix,
  GetFunctionOrAsyncFunctionReturnType,
} from "types/index";
import { emptyWarningHandler, thorwNewError } from "utils/log";

/**
 * 空异常返回
 * @param emptyErrorMsg
 */
export const emptyReturnError = <F extends (...args: any[]) => any>(
  emptyErrorMsg: string
): MethodDecoratorFix<F> => {
  return function (target, propertKey, describtor) {
    const originMethod = describtor.value!;
    describtor.value = function (this: any, ...args: any[]) {
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
              } else {
                resolve(r);
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

/** 条件判定装饰器
 * 建议使用 a => a 的形式进行同步装饰，异步装饰相对包装较深
 */
export const conditionReturnError = <F extends (...args: any[]) => any>(
  checkCondition: (
    result: GetFunctionOrAsyncFunctionReturnType<F>
  ) => Parameters<typeof thorwNewError> | void
): MethodDecoratorFix<F> => {
  return function (target, propertKey, describtor) {
    const originMethod = describtor.value!;
    describtor.value = function (this: any, ...args: any[]) {
      const result = originMethod.apply(this, args);
      if (isPromise(result)) {
        return new Promise((resolve, reject) => {
          result
            .then((r: any) => {
              const checked = checkCondition(r);
              if (checked) {
                reject(thorwNewError(...checked));
              } else {
                resolve(r);
              }
            })
            .catch(reject);
        });
      }
      const checked = checkCondition(result);
      if (checked) {
        throw thorwNewError(...checked);
      }
      return result;
    } as F;
  };
};