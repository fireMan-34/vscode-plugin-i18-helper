# Change Log

## 0.0.1

All notable changes to the "i18n-extension" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

### [Unreleased]

- Initial release

## 0.1.4

- init: 添加 react page
- refector 指令代码重构（抽象层次）
- docs: 添加版权信息
- ci: 输出路径采用命令行位置
- pref: 添加调试配置

## 0.1.6

- build: 添加 husky hook 依赖
- script: 添加 commit Message 依赖

## 0.1.7

- docs: 规范化 npm 命令

## 0.1.13
- build: 依赖管理器 pnpm 切换 npm
- build: 添加 git hook 依赖
- script: 添加提价 hook 测试
- chore: 添加预发布命令占位
- docs: 添加 study 目录文件忽略
- chore: 添加 packge 提交检测以及预安装命令

## 0.1.21
- pref: 添加注册命令行上下文 ts 类型支持
- build: 更新 node 版本 移除错误版本 ts 提示
- refactor: 移除通用命名校验检验规则 (影响其它命名规则 如常量等)
- feat: 完善国际化扫描文件目录
- docs: 添加忽略运行时目录文件逻辑
- build: 添加 esMoudleInteropus 导出支持
- pref: 添加 webpack 打包项目优化 插件 extensions 2200+ms -> 180+ms 6500+ms -> 200+ms
- refactor: 重构 lodash 引入逻辑，改为按需引入

## 0.1.32
- refactor: 代码重命名 i18 -> i18n
- refactor: ts 类型文件重组
- refactor: 迁移 getRunTimePath 函数
- feat: 运行时全局配置 TS
- buid: 自动化构建
- fix: 国际化语言简繁识别问题，日文识别问题修复 添加 chinese-conv 依赖 和手动声明
- test: 添加国际化语言测试用例
- feat: 添加全局配置文件初版
- refactor: 工具包 str 重命名为 path
- feat: 添加工具选中多种目录结构
- refactor: 选择目录结构逻辑精简

## 0.1.49
- refactor 错误调试微改
- feat: 发布订阅处理异常问题 添加 Rxjs 依赖，按需导入 270k+ -> 317k+
- feat: 逻辑解耦-写入全局初始化配置
- feat: 补充 package.json 信息
- refactor: 常量文件名重组
- pref: 扫描国际化命令分组到修改组
- fix: 修复无扫描国际化弹窗问题
- feat: 公共工具库-路径更新-匹配路由模式下逻辑
- pref: 添加 vscode 调试启动配置目录
- test: 添加子路径功能
- feat:  添加相同路径检测 & 添加相应单元测试
- style 更新匹配不到错误路径提示
- feat: 添加匹配正则文本测试
- fix: 修复国际化提示无效问题
- fix: 修复错误输出失败问题
- feat: 国际化输入提示基本开发完成
- test: 更新国际化单元字符串匹配测试

## 1.1.55
- refactor: 调整 RxJs 插件资源释放
- refactor: 移除扫描国际化注释代码
- perf: 添加搜索忽略生成式文件夹 .vscode-test
- feat: 添加动态扫描目录配置
- refactor: 移除冗余的初始化执行代码
- feat: 更新插件激活事件
### 版本碎碎念
- 到了这个版本，我已经基本支持公司的国际化扫描目录和智能提示功能，但是还是有很多不完善。
  - 对于 多个扫描国际化文件夹以及多个子项目在同一个文件夹会出现匹配串味的问题
  - 只支持 formatMessage({id: xxxx, defaultMessage: xxxx }) 形式的代码解析和代码生成问题
  - 文件夹扫描目前只能基于手动扫描问题
  - 代码关联文件跳转问题
  - 代码悬浮问题
  - 还有视图交互性不足问题
  - 个人学习其它优秀作者和英文阅读能力不足的焦虑
- ~~接下来的版本会以 0.2.x 开头，继续优化我的插件~~

- 暂时还是 0.1.xx 吧

## 0.1.63
- feat: 支持 jsx tsx 智能提示
- refactor: 调整注册 provider 逻辑
- refactor: 重命名 正则变量名
- feat: 添加获取工作目录新增匹配类型原生获取
- feat: 自动跳转功能
- tets: 链接跳转匹配正则测试
- refactor: 精简智能提示 & 自定义跳转代码
- feat: 高亮国际化信息

## 0.2.16
- ci: 推送构建测试相关 ** (目前还在开发阶段)
- feat: 配置动态模板基础功能
- test: 动态模板测试用例
- feat: 国际化模板功能部分开发
- feat: 复制键值对生成动态国际化模板完成
- refactor: 添加模型目录，扫描逻辑抽离
- feat: 多种国际化代码功能类型开发
- feat: 文本匹配解析类局部完善
- refactor: 正则常量位置调整
- feat: 添加渲染模板字符串常量
- feat: 函数库添加字符串格式化判断
- test: 添加 i8n.t 正则测试
- pref: 添加国际化集合运行时缓存
- pref: 添加智能提示缓存
- feat: 添加 vue 字符串范围匹配
- feat: 添加配置过滤解析对象

## 0.2.24
- fix: 修复工作目录切换后因缓存无法读取最新值问题
- feat: 添加部分插件常量
- feat: 添加日志、字符串相关函数
- fix: 单行模式下匹配异常问题
- feat: 链接关联跳转精确文件行列
- style: 移除多余的换行符
- feat: 添加悬浮后显示可跳转文件地址链接
- feat: defaultMessage 识别 key

## 0.2.60
- feat: 添加单元测试
- feat: 添加单元测试别名路径支持
- docs: 添加国际化扫描目录思维导图
- feat: 提取国际化命令右键菜单
- refactor: 替换环境变量名
- fix: 修复国际化视图配置错误导致的异常
- fix: 添加国际化自定义右键菜单方式
- refactor: 区分宿主包， 重构包工具模块，添加测试
- feat: 函数库异步路径判断文件类型
- test: 添加异步单元目录测试
- feat: 工具库新增获取子目录函数
- test: 测试子目录函数获取功能
- refactor: log 模块分离
- feat: 扫描文件目录树基础功能开发
- feat: 添加目录视图是否相对子级和相对父路径
- fix: 修复获取初始化数据异常
- refactor: 类型模块文件拆分
- perf: 添加测试工作目录
- refacor: 全局配置功能重置
- test: omit 用例
- feat: 添加默认保存配置规则开发
- feat: 添加命令配置 omit 测试数据补全调整命令
- docs: 自定义开发视图备注
- feat: 添加自定义规则文件夹刷新逻辑
- feat: 添加规则文件夹添加目录级别条件
- feat: 添加目录规则文件夹视图管理对象
- feat: 添加视图命令获取最新菜单
- chore: 忽略 node_modules 相关文件
- feat: 添加国际化扫描规则到视图中
- docs: 更新任务文档
- feat: 工具库异步链式返回
- test: 添加异步链式返回测试
- refactor: i18 -> i18n 变量名
- feat: 添加规则目录扫描功能基础
- test: 添加路径检测测试
- feat: 添加初始化失效数据扫描

# 0.2.70
- fix: 修复自定义扫描规则顶部文件夹范文属性空指针
- feat: 添加初始化扫描命令 移除 editor 强依赖 ，重新调整类型
- feat: 工具库定时移除缓存
- refactor ts 无法正确识别 never 类型保护
- feat: 添加目录获取匹配方式激活文件
- feat: 添加目录获取最后一次激活文件
- fix: 切换激活目录逻辑 1. 取消默认 pick 模式 2. 逻辑采用当前活跃文件和首位目录 3. 视图采用多工作区
- fix: 移除因缓存导致的提示异常问题
- fix: 修复静态类型常量混用覆盖问题
- fix: 设置国际化目录规则不可展开

# 0.2.93
  - feat: 更新插件图标
  - pref: 添加同类 vscode 国际化插件 repo 代码仅用于个人学习
  - ci: typescript 跳过临时编译文件
  - feat: 翻译 api 功能开发中 1
  - feat: requestX 方法兼容 json（后面改 axios）
  - feat: 优化 json 请求逻辑
  - pref: 添加搜索忽略文件
  - fix: 修复新增缺少的配置
  - test: 添加 glob package 测试用例
  - feat: 添加 md5 转换函数和测试函数
  - test: 注释无效测试函数
  - pref: 忽略 mock 文件目录
  - feat: 暂存翻译 api 对接
  - feat: 联调百度翻译 api
  - docs: 更新功能计划文档
  - docs: 类型体操自学课
  - feat: 动态模板功能开发中 1
  - feat: 动态模板功能开发中 2
  - test: 添加动态模板测试用例
  - feat: 添加动态模板功能
  - fix: 修复调试不更新问题
  - feat: 动态模板悬浮提示，跳转
  - feat: 动态模板智能提示
  - docs: 更新国际化文档

# 0.2.107
  - feat: 1s 频次扫描国际化 key 转国际化代码
  - feat: 添加国际化配置欢迎页面
  - feat： 添加国际化配置极简 webview
  - feat: 对接网易接口 （自动翻译暂未上线）
  - feat: 添加国际化主语言转国际化代码
  - feat: 选中文本转国际化代码命令
  - feat: 右键菜单、快捷键添加
  - fix: 修复获取当前数据所有国际化类型为空数据 bug
  - build: 引入 tailwindCSS 为后面开发 webview 做做准备
  - pref: 更新 vscode 插件提交配置
  - refacor: 代码引入装饰器
  - refacor: 改进提示用语
  - docs: 更新开发文档
  - test: 修复测试用例失效或错误问题
  
# 0.2.108
  - feat: 添加国际化目录数据热更新

# 1.0.11
  - fix: 获取初始配置过久错误
  - refacor: 重构国际化文件对象缓存
  - feat: 更新模板嵌入变量写法
  - feat: 添加多模板配置设置
  - feat: 添加模板转模型
  - feat: 模型添加匹配国际化 key的值 功能
  - feat: 添加悬浮面板 多模板模式
  - feat: 添加跳转 多模板模式
  - feat: 添加输入候选 多模板模式
  - feat: 添加命令生成代码 多模板模式

# 致谢
- 感谢同事 舒婷 的建议。
- 感谢同事 勉盛 的建议。