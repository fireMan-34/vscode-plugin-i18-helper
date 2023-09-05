import type { DocumentSelector } from 'vscode';

/** 插件支持的文件类型 */
export const SUPPORT_DOCUMENT_SELECTOR: DocumentSelector = [
    { language: 'typescript', scheme: 'file', },
    { language: 'javascript', scheme: 'file', },
    { language: 'typescriptreact', scheme: 'file', },
    { language: 'javascriptreact', scheme: 'file', },
];