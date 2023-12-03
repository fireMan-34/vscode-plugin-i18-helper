import { isPromise } from 'util/types';
import isEqual from 'lodash/isEqual';

export interface CacheClass {
    readonly cache: Map<string|number|symbol, any>;
    readonly useCache: true,
    readonly getCache: (key: string) => any;
    readonly setCache: (key: string, value: any) => void;
    readonly removeCache: (key?: string) => void;
    [k: string|symbol]: any,
}

/** 持久化 对象
 * 增添方法无法拥有类型校验
  */
export function cacheClassDecoratorFactory<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor implements CacheClass {
        constructor(...args: any[]) {
            super(...args);
        }
        /** 使用缓存类, 添加后圆函数时存在但是ts无法直接识别的。 */
        readonly useCache = true;
        readonly cache = new Map();
        getCache(key: string) {
            return this.cache.get(key);
        }
        setCache(key: string, value: any) {
            this.cache.set(key, value);
        };
        removeCache(key?: string) {
            if (key) {
                this.cache.delete(key);
            } else {
                this.cache.clear();
            }
        }
    };
};

/** 缓存持久化方法 */
export function cacheMethDecoratorFactory() {
    return function (proptype: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = proptype[propertyKey];
        descriptor.value = function (this: CacheClass, ...args: any[]) {
            const cache = this.cache;
            const mayCache: null | [any[], any] = cache.get(propertyKey);
            const [cacheAgrs, cacheResult] = mayCache || [];
            const isUseCache = isEqual(cacheAgrs, args);
            if (isUseCache) {
                return cacheResult;
            }
            const result = Reflect.apply(method, this, args);
            const isPromiseResult = isPromise(result);
            if (isPromiseResult) {
                result.catch(() => cache.delete(propertyKey));
            };
            cache.set(propertyKey, [args, result]);
            return result;
        };
    };
};

/** 属性更新清理缓存
 * @version 1 添加注入的函数类型作为输入提示，暂时找不到办法获取装饰类的类型
 */
export function cacheSetCleanFactory<C extends { new (...args: any[]): {} }>(clearnCacheKeys: (keyof InstanceType<C>)[] | [], initVal?: any): MethodDecorator {
    return function (target, propertyKey, descriptor) {
        const innerPropKey = `#${propertyKey as string}`;
        descriptor.get = (function () {
            let isFisrt = true;
            return function (this: Record<string, any>) {
                return isFisrt ? (isFisrt = false, this[innerPropKey] = initVal) : this[innerPropKey];
            };
        })();
        descriptor.set = function (this: CacheClass, newValue: any) {
            const cache = this.cache;
            if (clearnCacheKeys.length > 0) {
                clearnCacheKeys.forEach(key => cache.delete(key));
            } else {
                cache.clear();
            }
            this[innerPropKey] = newValue;
        };
    };
};
