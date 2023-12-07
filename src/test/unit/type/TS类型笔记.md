# 类型

## `__${string}Barnd`

  看起来是个标记属性，可能有一些内部属性支持。
## SyntaxKind
  代码碎片类型 类似 markdown 解析器一样
### Trivia
  翻译琐事，冷知识。
  大概编写的程序员就是这些不参与语法转换，无需过多关注的意识。
  里面类型大致有: 注释 、空行 、空白、冲突标记、无文本、Shebang
### Literal
  标识符
#### TemplateLiteral
  纯字符串
  模板头
  模板体
  模板结束

### Token 
  运算符
  OpenBraceToken  `{` 起始花括号
  CloseBraceToken `}` 闭合花括号
  OpenParenToken `(` 起始圆括号
  CloseParenToken `)` 闭合圆括号
  OpenBracketToken `[` 起始方括号
  CloseBracketToken `]` 闭合方括号
  DotToken `.` 点
  DotDotDotToken `..` 点点 https://www.reddit.com/r/javascript/comments/5lo7dq/why_2tostring_works_with_2_dots/?rdt=44246
  SemicolonToken `;` 分括号
  CommaToken `,` 逗号
  QuestionDotToken `?.` 可选链
  LessThanToken `<`
  LessThanSlashToken `</`
  GreaterThanToken `>`
  LessThanEqualsToken `<=`
  GreaterThanEqualsToken `>=`
  EqualsEqualsToken `==`
  ExclamationEqualsToken `!=`
  EqualsEqualsEqualsToken `==`
  ExclamationEqualsEqualsToken `===`
  EqualsGreaterThanToken `>=`
  PlusToken `+`
  MinusToken `-`
  AsteriskToken `*`
  AsteriskAsteriskToken `**`
  SlashToken `/`
  PercentToken `%`
  PlusPlusToken `++`
  MinusMinusToken `--`
  LessThanLessThanToken `<<`
  GreaterThanGreaterThanToken `>>`
  AmpersandToken `&`
  BarToken `|`
  CaretToken `^`
  ExclamationToken `!`
  TildeToken `~`
  AmpersandAmpersandToken `&&`
  BarBarToken `||`
  QuestionToken `?`
  ColonToken `:`
  AtToken `@`
  QuestionQuestionToken `??`
  BacktickToken 只有JSDoc扫描仪生成BacktickToken。普通扫描仪生成NoSubstitutionTemplateLiteral和相关种类。
  HashToken 只有JSDoc扫描程序才能生成HashToken。普通扫描仪生成PrivateIdentifier。
  EqualsToken `=`
  PlusEqualsToken `+=`
  MinusEqualsToken `-=`
  AsteriskEqualsToken `*=` 乘等
  AsteriskAsteriskEqualsToken `**=` 幂等
  SlashEqualsToken = `/=`
  PercentEqualsToken `%=`
  LessThanLessThanEqualsToken `>>=`
  GreaterThanGreaterThanEqualsToken `>>=`
  GreaterThanGreaterThanGreaterThanEqualsToken `>>>=`
  AmpersandEqualsToken `&=`
  BarEqualsToken `|=`
  BarBarEqualsToken `||=`
  AmpersandAmpersandEqualsToken `&&=`
  QuestionQuestionEqualsToken `??=`
  CaretEqualsToken `^=`

### Identifier 
  修饰符
  Identifier `public`
  PrivateIdentifier `private`

### Keyword
  关键字
  BreakKeyword `break`
  CaseKeyword `case`
  CatchKeyword `catch`
  ClassKeyword `class`
  ConstKeyword `const`
  ContinueKeyword `continue`
  DebuggerKeyword `debugger`
  DefaultKeyword `default`
  DeleteKeyword `delete`
  DoKeyword `do`
  ElseKeyword `else`
  EnumKeyword `enum`
  ExportKeyword `export`
  ExtendsKeyword `extends`
  FalseKeyword `false`
  FinallyKeyword `finally`
  ForKeyword `for`
  FunctionKeyword `function`
  IfKeyword `if`
  ImportKeyword `import`
  InKeyword `in`
  InstanceOfKeyword `instanceof`
  NewKeyword `new`
  NullKeyword `null`
  ReturnKeyword `return`
  SuperKeyword `super`
  SwitchKeyword `switch`
  ThisKeyword `this`
  ThrowKeyword `throw`
  TrueKeyword `true`
  TryKeyword `try`
  TypeOfKeyword `typeof`
  VarKeyword `var`
  VoidKeyword `void`
  WhileKeyword `while`
  WithKeyword `with`
  ImplementsKeyword `implements`
  InterfaceKeyword `interface`
  LetKeyword `let`
  PackageKeyword `package`
  PrivateKeyword `private`
  ProtectedKeyword `protected`
  PublicKeyword `public`
  StaticKeyword `static`
  YieldKeyword `yield`
  AbstractKeyword `abstract`
  AsKeyword `as`
  AssertsKeyword `asserts`
  AnyKeyword `any`
  AwaitKeyword `await`
  BooleanKeyword `boolean`
  ConstructorKeyword `constructor`
  DeclareKeyword `declare`
  GetKeyword `get`
  InferKeyword `infer`
  IsKeyword `is`
  KeyOfKeyword `keyof`
  ModuleKeyword `module`
  NamespaceKeyword `namespace`
  NeverKeyword `never`
  ReadonlyKeyword `readonly`
  RequireKeyword `require`
  NumberKeyword `number`
  ObjectKeyword `object`
  SetKeyword `set`
  SatisfiesKeyword `satisfies`
  StringKeyword `string`
  SymbolKeyword `symbol`
  TypeKeyword `type`
  UndefinedKeyword `undefined`
  UniqueKeyword `unique`
  UnknownKeyword `unknown`
  FromKeyword `from`
  GlobalKeyword `global`
  BigIntKeyword `bigint`
  OverrideKeyword `override`
  OfKeyword `of`

### Name
 疑似属性限制

### Signature
  属性方法函数构造函数索引签名

### Declaration
  说明

### JSX
  JsxText JSX 文本
  JsxTextAllWhiteSpaces JSX 空行

### `${string}Type`

### `Type${string}`

### `${xxx}BingdPattern`

### `${string}Expression`
  表达式
  


// 8:56 分机器砍的声音消失
// 9:08
