let messageListener;

/** @type {import('./base').IWebviewVsCodeApi} */
const vscode = acquireVsCodeApi();

window.addEventListener('message', function(ev){
    messageListener = arguments.callee();
});

window.onclose = function(){
    window.removeEventListener('message', messageListener);
};


// export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890