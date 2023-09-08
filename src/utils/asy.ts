import assign from 'lodash/assign';

type PickPromise<P> = P extends Promise<infer R> ? R : P;

/** 映射 map 类型 promise */
export function PromiseAllMap<T extends Record<string, Promise<any>>, K extends keyof T>(map: T): Promise<{ [key in K]: PickPromise<T[K]> }> {
  return Promise.all(
    Object
      .entries(map)
      .map(([key, promise]) =>
        promise.then(
          (val) => ({ [key]: val })
        ))).then(newSets => assign({}, ...newSets));
};

export function sleep(time: number = 1000): Promise<number>{
  return new Promise((resolve) => {
    setTimeout(() => { resolve(time); }, time);
  });
};