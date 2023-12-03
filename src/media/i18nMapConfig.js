/** @type {import('./base')} */

let messageListener;


const vscode = acquireVsCodeApi();

window.addEventListener('message', function(ev){
    messageListener = arguments.callee();
});

window.onclose = function(){
    window.removeEventListener('message', messageListener);
};