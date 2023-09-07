const GLOBAL_RUN_TIME_CACHE: Record<string, any> = {};

export const createRunTimeCahce = (namespace?: string) => {
  if (namespace) {
    GLOBAL_RUN_TIME_CACHE[namespace] = {};
  }
  const cache = namespace ? GLOBAL_RUN_TIME_CACHE[namespace] : {};

  const ctl = {
    getKey: (key: string | number) => {
      return cache[key];
    },
    setKey: (key: string | number, value: any) => {
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