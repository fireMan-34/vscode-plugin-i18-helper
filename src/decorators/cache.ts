import isEqual from "lodash/isEqual";
import { isPromise } from "util/types";

export interface CacheClass {
  readonly cache: Map<string | number | symbol, any>;
  readonly useCache: true;
  readonly getCache: (key: string | number | symbol) => any;
  readonly setCache: (key: string | number | symbol, value: any) => void;
  readonly removeCache: (key?: string | number | symbol) => void;
  [k: string | number | symbol]: any;
}

/** 持久化 对象
 * 增添方法无法拥有类型校验
 */
export function cacheClassDecoratorFactory<
  T extends { new (...args: any[]): {} }
>(constructor: T) {
  return class extends constructor implements CacheClass {
    constructor(...args: any[]) {
      super(...args);
    }
    /** 使用缓存类, 添加后圆函数时存在但是ts无法直接识别的。 */
    readonly useCache = true;
    readonly cache = new Map();
    getCache(key: string | number | symbol) {
      return this.cache.get(key);
    }
    setCache(key: string | number | symbol, value: any) {
      this.cache.set(key, value);
    }
    removeCache(key?: string | number | symbol) {
      if (key) {
        this.cache.delete(key);
      } else {
        this.cache.clear();
      }
    }
  };
}

/** 缓存持久化方法 */
export function cacheMethDecoratorFactory() {
  return function (
    proptype: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = proptype[propertyKey];
    descriptor.value = function (this: CacheClass, ...args: any[]) {
      const mayCache: null | [any[], any] = this.getCache(propertyKey);
      const [cacheAgrs, cacheResult] = mayCache || [];
      const isUseCache = isEqual(cacheAgrs, args);
      if (isUseCache) {
        return cacheResult;
      }
      const result = Reflect.apply(method, this, args);
      const isPromiseResult = isPromise(result);
      if (isPromiseResult) {
        result.catch(() => this.removeCache(propertyKey));
      }
      this.setCache(propertyKey, [args, result]);
      return result;
    };
  };
}

/**
 * @tilte 属性更新清理缓存,存储器
 * @param clearnCacheKeys 清理缓存方法名 空则清理所有缓存
 * @param initVal 初始值
 * @version 1 添加注入的函数类型作为输入提示，暂时找不到办法获取装饰类的类型
 */
export function cacheSetCleanFactory<C extends { new (...args: any[]): {} }>(
  clearnCacheKeys: (keyof InstanceType<C>)[] | [] = [],
  initVal?: any
): MethodDecorator {
  return function (_target, propertyKey, descriptor) {
    const innerPropKey = `#${propertyKey as string}`;
    descriptor.get = (function () {
      let isFisrt = true;
      return function (this: Record<string, any>) {
        return isFisrt
          ? ((isFisrt = false), (this[innerPropKey] = initVal))
          : this[innerPropKey];
      };
    })();
    descriptor.set = function (this: CacheClass, newValue: any) {
      if (clearnCacheKeys.length > 0) {
        clearnCacheKeys.forEach((key) => this.removeCache(key));
      } else {
        this.removeCache();
      }
      this[innerPropKey] = newValue;
    };
  };
}

/** 存取器自动清理缓存字段 */
export function cacheAccessorCleanFacory<
  C extends { new (...args: any[]): {} },
  T = any
>(clearnCacheKeys: (keyof InstanceType<C>)[]|[] =[]) {
  return function (
    traget: any,
    propertyKey: string,
    describtor: TypedPropertyDescriptor<T>
  ) {
    // 无法通过 target[propertyKey]  报错 私有属性 ，但打印未发现该对象和类以及实例原型有关
    const manager = {
      v: describtor.value,
    };
    describtor.get = function (){
      return manager.v!;
    };
    describtor.set = function (this: CacheClass, v) {
      if (clearnCacheKeys.length > 0) {
        clearnCacheKeys.forEach((key) => this.removeCache(key));
      } else {
        this.removeCache();
      }
      manager.v = v;
    };
  };
}
