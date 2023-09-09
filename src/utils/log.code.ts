import { Position, Range, window } from "vscode";
import { LoggerSubject, LoggerLevel, LoggerSubscription } from "utils/log";

/** 文档对象打印翻遍查询变量 */
export const printDocumentObjectLog = (o: Position | Range): { x: number, y: number }
  | { x: number, y: number }[]
  | {} => {
  if (o instanceof Position) {
    return {
      x: o.character,
      y: o.line,
    };
  }

  if (o instanceof Range) {
    return [o.start, o.end].map(printDocumentObjectLog);
  }

  return {};
};

const LoggerConsnoleLogSubscription = LoggerSubject.subscribe({
    next(observable) {
      const msg = observable.message;
  
      switch (observable.level) {
        case LoggerLevel.warn:
          window.showWarningMessage(msg);
          break;
        case LoggerLevel.err:
          window.showErrorMessage(msg);
          break;
        case LoggerLevel.info:
        default:
          window.showInformationMessage(msg);
          break;
      }
    }
  });
  
  LoggerSubscription.add(LoggerConsnoleLogSubscription);