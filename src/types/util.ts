/** 项目自用的方法装饰器类型，对属性做了覆盖可以动态设置类型 */
export type MethodDecoratorFix<T = any> = (
  target: Object,
  propertyKey: string|symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;
