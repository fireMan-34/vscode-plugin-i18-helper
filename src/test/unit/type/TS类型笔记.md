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
  FirstKeyword `first`
  LastKeyword `last`

### `${stirng}ReservedWord`
  保留字
  FirstReservedWord 首次保留字
  LastReservedWord 末尾保留字
  FirstFutureReservedWord
  LastFutureReservedWord
  FirstTypeNode
  LastTypeNode
  FirstPunctuation 标点符号
  LastPunctuation 标点符号
  FirstToken
  LastToken
  FirstTriviaToken
  LastTriviaToken
  FirstLiteralToken
  LastLiteralToken
  FirstTemplateToken
  LastTemplateToken
  FirstBinaryOperator
  LastBinaryOperator
  FirstStatement
  LastStatement
  FirstNode
  FirstJSDocNode
  LastJSDocNode
  FirstJSDocTagNode
  LastJSDocTagNode

### Name
 疑似属性限制

### Signature
  属性方法函数构造函数索引签名

### Declaration
  说明

### JSX
  JsxText JSX 文本
  JsxTextAllWhiteSpaces JSX 空行
  JsxElement jsx 元素
  JsxSelfClosingElement jsx 自关闭元素
  JsxOpeningElement jsx 开始元素
  JsxClosingFragment jsx 自闭元素
  JsxAttribute jsx 属性
  JsxAttributes jsx 属性集合
  JsxNamespacedName jsx 命名空间名字


### `${string}Type`

### `Type${string}`

### `${xxx}BingdPattern`

### `${string}Expression`
  表达式
  ArrayLiteralExpression 数组模板表达式
  ObjectLiteralExpression 对象模板表达式
  PropertyAccessExpression 属性存取器表达式
  ElementAccessExpression 元素存取器表达式
  CallExpression 函数调用表达式
  NewExpression 构造函数调用表达式
  TaggedTemplateExpression 模板字符串表达式
  TypeAssertionExpression 断言类型表达式
  ParenthesizedExpression 括号表达式
  FunctionExpression 函数表达式
  DeleteExpression 删除表达式
  TypeOfExpression 提取 js 类型表达式
  VoidExpression 空值表达式
  AwaitExpression 异步表达式
  PrefixUnaryExpression 前缀一元表达式
  PostfixUnaryExpression 后缀一元表达式
  BinaryExpression 二元表达式
  ConditionalExpression 三元表达式
  TemplateExpression 模板表达式
  YieldExpression 生成器表达式
  SpreadElement 展开表达式
  ClassExpression 类表达式
  OmittedExpression 省略属性表达式
  ExpressionWithTypeArguments 携带参数表达式
  AsExpression as 表达式
  NonNullExpression 非空表达式
  SyntheticExpression 合成表达式
  SatisfiesExpression 满足表达式
  JsxExpression jsx 表达式
  JSDocTypeExpression jsdoc type 表达式
  PartiallyEmittedExpression 部分射出表达式
  CommaListExpression 逗号列表表达式
  SyntheticReferenceExpression 合成引用表达式
  
  
### `${string}Statement`
  语句
  EmptyStatement 空语句
  VariableStatement 变量语句
  ExpressionStatement 表达式语句
  IfStatement 条件语句
  DoStatement 循环语句先执行一次
  WhileStatement 循环语句
  ForStatement 循环语句1
  ForInStatement 循环语句2 对象类型可枚举
  ForOfStatement 循环语句3 可迭代
  ContinueStatement 循环控制语句下一次
  BreakStatement 循环控制语句跳出
  ReturnStatement 返回语句
  WithStatement 上下文语句
  SwitchStatement 条件语句
  LabeledStatement 标签语句
  ThrowStatement 抛出语句
  TryStatement 捕获语句
  DebuggerStatement 调试语句
  NotEmittedStatement 非射出语句

### `${string}Declaration`
  说明
  VariableDeclaration 变量说明
  VariableDeclarationList 变量列表说明
  FunctionDeclaration 函数说明
  ClassDeclaration 类说明
  InterfaceDeclaration 接口说明
  TypeAliasDeclaration 类型别名说明
  EnumDeclaration 枚举说明
  ModuleDeclaration 模块说明
  NamespaceExportDeclaration 命名空间说明
  ImportEqualsDeclaration 导入全等说明
  ImportDeclaration 导入说明
  ExportDeclaration 导出说明
  MissingDeclaration 丢失类型说明


### `${string}Block`
  ModuleBlock 模块级块
  CaseBlock case 块
  
### `{string}Clause`
  子句
  ImportClause
  CaseClause
  DefaultClause
  HeritageClause 继承
  CatchClause
  AssertClause
  AssertEntry
  
### `${string}Assignment`
  赋值
  ExportAssignment 导出赋值
  PropertyAssignment
  ShorthandPropertyAssignment 简写属性
  SpreadAssignment 展开赋值
  FirstAssignment
  LastAssignment
  FirstCompoundAssignment 首次混合分配
  LastCompoundAssignment

### `${string}Reference`
  引用
  JSDocNameReference

### 杂类
  NamespaceImport 命名空间导入
  NamedImports 重命名命名导入
  ImportSpecifier 导入说明符
  NamedExports 重命名导出
  ExportSpecifier 导出说明符
  ExternalModuleReference 外部模块引用
  ImportTypeAssertionContainer 导入类型断言容器
  EnumMember 枚举成员
  SourceFile 源文件
  Bundle 打包文件
  JSDocMemberName jsdocs成员名
  JSDocAllType jsdocs全部类型
  JSDocUnknownType jsdocs未知类型
  JSDocNullableType jsdocs空类型
  JSDocNonNullableType jsdocs非空类型
  JSDocOptionalType jsdocs 可选类型
  JSDocFunctionType jsdocs函数类型
  JSDocVariadicType jsdocs可变参数类型
  JSDocNamepathType jsdocs 名称路径类型
  JSDocTypeLiteral jsdocs类型字面量
  JSDoc
  JSDocText jsdocs 文本类型
  JSDocTypeLiteral 字面量文本类型
  JSDocSignature 签名类型
  JSDocLink 链接类型
  JSDocLinkCode 链接代码类型
  JSDocLinkPlain 链接普通类型
  JSDocTag jsdoc 标签
  JSDocAugmentsTag 标签参数
  JSDocImplementsTag 实现参数
  JSDocAuthorTag 作者标签
  JSDocDeprecatedTag 废弃标签
  JSDocClassTag 类标签
  JSDocPublicTag 公共标签
  JSDocPrivateTag 私有标签
  JSDocProtectedTag 受保护标签
  JSDocReadonlyTag 只读标签
  JSDocOverrideTag 覆盖标签
  JSDocCallbackTag 回调标签
  JSDocOverloadTag 超载标签
  JSDocEnumTag 枚举标记
  JSDocParameterTag 参数标记
  JSDocReturnTag 返回标记
  JSDocThisTag this 标记
  JSDocTypeTag 类型标记
  JSDocTemplateTag 模板标记
  JSDocTypedefTag 类型定义标记
  JSDocSeeTag 参考标记
  JSDocPropertyTag 属性标记
  JSDocThrowsTag 报错标记
  JSDocSatisfiesTag 满足标记
  SyntaxList 句法列表
  Count 计数

  
---

### TriviaSyntaxKind
  无效语法种类
  SingleLineCommentTrivia 单行提示
  MultiLineCommentTrivia 多行注释
  NewLineTrivia 换行
  WhitespaceTrivia 空白
  ShebangTrivia
  ConflictMarkerTrivia 冲突

### LiteralSyntaxKind

  字面量种类
  NumericLiteral
  BigIntLiteral 
  StringLiteral
  JsxText
  JsxTextAllWhiteSpaces
  RegularExpressionLiteral
  NoSubstitutionTemplateLiteral

### PseudoLiteralSyntaxKind
  TemplateHead
  TemplateMiddle
  TemplateTail
### PunctuationSyntaxKind
  标点符号种类
### KeywordSyntaxKind
  关键字种类
### ModifierSyntaxKind
  修饰符种类
### KeywordTypeSyntaxKind
  关键字类型种类
### TokenSyntaxKind
  词法种类
  Unknown 未知
  EndOfFileToken 文件结束
  TriviaSyntaxKind 无关种类
  LiteralSyntaxKind 字面种类
  PseudoLiteralSyntaxKind 伪字面种类
  PunctuationSyntaxKind 标点种类
  Identifier 标识符种类
  KeywordSyntaxKind 关键字种类
### JsxTokenSyntaxKind
  JSX 种类
  LessThanSlashToken `</`
  EndOfFileToken 
  ConflictMarkerTrivia 冲突标记
  JsxText  
  JsxTextAllWhiteSpaces
  OpenBraceToken
  LessThanToken
### JSDocSyntaxKind

---

### NodeFlags
  节点标记
### ModifierFlags
  修饰标记
### JsxFlags
  jsx 标记
### Node
  基类 提供底层 节点 方法
  JSDocContainer 扩展
  LocalsContainer 本地扩展
### HasJSDoc
  - [declaration](#stringdeclaration)
  - ArrorFunction
  - BinaryExpression
  - Block
  - BreakStatement
  - CaseClause

// 8:56 分机器砍的声音消失
// 9:08
