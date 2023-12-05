import type { ExtensionContext } from "vscode";
import { window, commands, } from 'vscode';


import { CMD_KEY } from "constants/cmd";
import { GeneratedCodeFromStrMode, type ICommondItem } from "types/index";

class SelectionToI18nCode implements ICommondItem {
  cmd: string = CMD_KEY.SELECTION_TOI18N_CODE;
  cmdExcuter: (context: ExtensionContext, ...args: any[]) => void = (
    context
  ) => {
    const { activeTextEditor,  showInformationMessage, } = window;
    showInformationMessage('准备调用');
    if (!activeTextEditor) {
      return;
    }
    const {
      selection,
      document,
    } = activeTextEditor;
    return commands.executeCommand(CMD_KEY.STR_TO_I18N_CODE, document.getText(selection), GeneratedCodeFromStrMode.silent);
  };
}

/** 文本选中匹配国际化字符串 */
const selectionToI18nCode = new SelectionToI18nCode();

export default selectionToI18nCode;
