import { window } from "vscode";
import { MethodDecoratorFix } from "types/util";

/** 捕获异步异常常用处理 */
export const catchAsyncError = <
  F extends (...args: any[]) => Promise<unknown>
>(): MethodDecoratorFix<F> =>
  function (target, propertKey, describtor) {
    const originMethod = describtor.value!;
    describtor.value = async function (this: any, ...args: any[]) {
      try {
        return await originMethod.apply(this, args);
      } catch (error) {
        if (typeof error === "string") {
          window.showInformationMessage(error);
        }
      }
    } as F;
  };