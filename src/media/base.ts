export interface IWebviewVsCodeApi<S = unknown, E = unknown> {
    /** 获取 插件 视图公用状态 */
    getState(): S;
    /** 设置公用状态 */
    setState(state: Partial<S>): void;
    /** 向插件发送消息 */
    postMessage(message: E): void;
}

declare global {
    var acquireVsCodeApi: () => IWebviewVsCodeApi;
}