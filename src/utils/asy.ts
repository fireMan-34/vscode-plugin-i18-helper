import assign from 'lodash/assign';

type PickPromise<P> = P extends Promise<infer R> ? R : P;

interface PromiseFunction<T> {
  (): Promise<T>;
}

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

/** 异步链式返回 */
export async function asyncChain<T>(asyncTasks: PromiseFunction<T>[]) {
  for (let asyncTask of asyncTasks) {
    try {
      const result = await asyncTask();
      return result;
    } catch (err) {
      continue;
    }
  }

  return Promise.reject('nothing async task work can resolve');
};