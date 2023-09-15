const GLOBAL_RUN_TIME_CACHE: Record<string, any> = {};

interface CreateRunTimeCahceOptions {
  /** 自动刷新时间
   * if has it , cache will remove sometime when over remove settime
   */
  autoRemoveTime?: number;
}

export const createRunTimeCahce = (namespace?: string, options?: CreateRunTimeCahceOptions) => {
  const {
    autoRemoveTime,
  } = {
    ...options,
  };
  if (namespace) {
    GLOBAL_RUN_TIME_CACHE[namespace] = {};
  }
  const cache = namespace ? GLOBAL_RUN_TIME_CACHE[namespace] : {};

  const ctl = {
    getKey: (key: string | number) => {
      return cache[key];
    },
    setKey: (key: string | number, value: any) => {
      if (autoRemoveTime) {
        setTimeout(() => ctl.clearKey(key), autoRemoveTime);
      }
      return cache[key] = value;
    },
    clearKey: (key: string | number) => {
      delete cache[key];
    },
    getAll: () => {
      return cache;
    },
    clearWhile: (key: string | number, condition: boolean) => {
      if (condition) {
        ctl.clearKey(key);
      }
      return condition;
    },
  };
  return ctl;
};