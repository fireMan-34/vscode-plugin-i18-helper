import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

/** 调试等级 */
export enum LoggerLevel {
  info,
  warn,
  err,
}

interface LoggerObservable {
  level: LoggerLevel,
  message: string,
}

/** @name 信息输出发布订阅中心 */
export const LoggerSubject = new Subject<LoggerObservable>();



/** @name LoggerSubject 的资源管理器 */
export const LoggerSubscription = new Subscription();



/**
 *空异常警告
 *
 * @param {string} [msg]
 */
const emptyWarningHandler = (msg: string, options = { isDefaultMessage : true, isThrow: true }) => {
  const { isDefaultMessage, isThrow } = options;
  const message = isDefaultMessage ?  `当前${msg || '上下文'}为空` : msg;
  const err =  thorwNewError(message, TypeError);
  if (isThrow) {
    throw err;
  }
  return err;
};

/** 错误处理浅层封装 */
const thorwNewError = (msg: string, errorClass: ErrorConstructor
  | TypeErrorConstructor
  | RangeErrorConstructor
): Error => {
  LoggerSubject.next({ level: LoggerLevel.err, message: msg });
  return new errorClass(msg);
};



export {
  emptyWarningHandler,
  thorwNewError,
};