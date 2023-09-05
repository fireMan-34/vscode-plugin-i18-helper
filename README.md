# i18n 个人使用插件

## 打包
1. 不要使用 yarn, pnpm 管理器, vsce 至今未支持
2. 修改默认 README.md
3. 添加版权信息 LICENSE

## 功能
  目前我的插件功能很简单，基于 formatMessage 一个是复制国际化键值对，第二个是国际化代码智能提示
1. 复制国际化键值对生成 `fromatMessage({id: 'xxx', defaultMessage: 'xxx',})`;
2. 扫描国际化目录，在资源菜单中，选择文件夹右键，目前支持 `locals` `local` 以及从配置里写入的配置
3. 在 ts 、 js 代码中输入 `formatMessage({})` 这样的代码就会自动读取从项目中扫描的国际化提示，目前会根据一个默认语言配置来读取对应的语法 token，然后自动输出 `{id: 'xxx', defaultMessage: 'xxx'}` 的代码内容。

## 计划
- [ ] 支持 jsx，tsx智能提示
- [ ] 完善扫描代码分步计划
- [ ] 文本自动生成代填充 key:value 形式 填充到项目文件夹中
- [ ] 翻译 Api
- [ ] 国际化视图
- [ ] 国际化悬浮信息
- [ ] 文件位置关联