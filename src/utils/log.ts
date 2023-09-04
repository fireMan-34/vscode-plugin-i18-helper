import { window } from "vscode";
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

/** 调试等级 */
enum LoggerLevel {
  info,
  warn,
  err,
}

interface LoggerObservable {
  level: LoggerLevel,
  message: string,
}

/** @name 信息输出发布订阅中心 */
const LoggerSubject = new Subject<LoggerObservable>();

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

/** @name LoggerSubject 的资源管理器 */
const LoggerSubscription = new Subscription();

LoggerSubscription.add(LoggerConsnoleLogSubscription);


/**
 *空异常警告
 *
 * @param {string} [msg]
 */
const emptyWarningHandler = (msg?: string) => {
  const message = `当前${msg || '上下文'}为空`;
  thorwNewError(message, TypeError);
};

/** 错误处理浅层封装 */
const thorwNewError = (msg: string, errorClass: ErrorConstructor
  | TypeErrorConstructor
  | RangeErrorConstructor
) => {
  LoggerSubject.next({ level: LoggerLevel.err, message: msg });
  throw new errorClass(msg);
};

export {
  LoggerSubject,
  LoggerSubscription,
  emptyWarningHandler,
  thorwNewError,
};