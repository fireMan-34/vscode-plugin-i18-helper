/** 项目自用的方法装饰器类型，对属性做了覆盖可以动态设置类型 */
export type MethodDecoratorFix<T = any> = (
  target: Object,
  propertyKey: string|symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;

/** 提取 promise 类型 */
export type GetPromiseValue<T>  = T extends Promise<infer U> ? U : T;

/** 提取函数同步或异步函数返回值 */
export type GetFunctionOrAsyncFunctionReturnType<F extends (...args: any[]) => unknown> = GetPromiseValue<ReturnType<F>>;