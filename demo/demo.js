const title = '仓库级自测项目';
const desc = '本代码仅用于手动级别插件自测功能。';

function getMessage(id, defaultMessage){};
function formatMessage(o) {};

const zh = getMessage('zhCN','中文');
const zh1 = formatMessage({
    id: 'zhCN',
    defaultMessage: '中文',
});
