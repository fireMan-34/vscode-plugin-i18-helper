/**　解析单个字符串类型生成字符串 */
type ParseParam<Param extends string> = Param extends `${infer Key}=${infer Value}` ? { [K in Key]: Value } : {};
/** 合并类型形成元组 */
type MergeValues<One, Other> = One extends Other ? One : Other extends unknown[] ? [One, ...Other] : [One, Other];

type MergeParams<OneParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
  [Key in keyof OneParam | keyof OtherParam]:
  Key extends keyof OneParam
  ? Key extends keyof OtherParam
  ? MergeValues<OneParam[Key], OtherParam[Key]>
  : OneParam[Key]
  : Key extends keyof OtherParam
  ? OtherParam[Key]
  : never;
};

type ParseQuerySttring<Str extends string> = Str extends `${infer Param}&${infer Rest}` ? MergeParams<ParseParam<Param>, ParseParam<Rest>> : ParseParam<Str>;

type PromiseType<P> = P extends Promise<infer T> ? T : never;

// 映射
type MapKey<T> = {
  [K in keyof T]: [ T[K], T[K], T[K] ]
};

//重映射 &合并同一类型过滤无效类型
type AsMapKey<T> = {
  [K in keyof T as `${K&string}-${T[K]&string}`]: T[K]
};