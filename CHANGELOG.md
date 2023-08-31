# Change Log

## 0.0.1

All notable changes to the "i18-extension" extension will be documented in this file.

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