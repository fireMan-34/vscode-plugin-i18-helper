import { window } from "vscode";

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

/**
 *空异常警告
 *
 * @param {string} [msg]
 */
const emptyWarningHandler = (msg?: string) => {
  const message = `当前${msg || '上下文'}为空`;
  window.showWarningMessage(message);
};

export {
  emptyWarningHandler,
};