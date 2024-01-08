import zhCN from './locale/zh_CN/study';

const title = '仓库级自测项目';
const desc = '本代码仅用于手动级别插件自测功能。';

function getMessage(id, defaultMessage){};
function formatMessage(o, v?) {};

const zh = getMessage('zhCN','中文');
const zh1 = formatMessage({
    id: 'zhCN',
    defaultMessage: '中文',
});

getMessage('often','经常');

getMessage('zhCN','中文')

formatMessage({
    id: 'zhCN',
    defaultMessage: '中文',
});

getMessage('login','登录')

console.log(zhCN);

formatMessage({
    id: 'zhCN',
    defaultMessage: 'zxx',
}, {
    aa:'sd'
});

formatMessage({
    id: 'needNum',
    defaultMessage: '需要输入变量{{num}}'
}, {
    num: 2
});
formatMessage({id: 'zhCN',defaultMessage: '中文',},)
formatMessage({ id: "chinese" });

formatMessage(
  { id: "needNum", defaultMessage: "需要输入变量{{num}}" },
  { num: "" },
);