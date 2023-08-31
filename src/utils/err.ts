import vscode from "vscode";

/**
 *空异常警告
 *
 * @param {string} [msg]
 */
const emptyWarningHandler = (msg?: string) => {
  vscode.window.showWarningMessage(`当前${msg || '上下文'}为空`);
};

export {
  emptyWarningHandler,
};