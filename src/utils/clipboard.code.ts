import { env, commands, } from 'vscode';
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Subscription } from 'rxjs/internal/Subscription';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';
import { CMD_KEY } from 'constants/cmd';
 
/** 剪切板订阅发布者 */
export const ClipboardSubject = new BehaviorSubject('');

/** 剪切板订阅发布管理者 */
export const ClipboardSubscription = new Subscription();

/** 剪切板订阅源 */
const clipboardSouce = interval(1000).pipe(
  map(() => env.clipboard.readText()),
  (s) => new Observable(o => {
    const queue:string[] = [];
    const scription = s.subscribe({
      next: (pro) => pro.then(v => {
        if (queue.length >= 1) {
          const l = queue[queue.length - 1];
          const isExist = l === v;
          if (isExist) {
            return;
          }
        } 
        queue.push(v);
        o.next(v);
      }),
      error: (e) => o.error(e),
      complete: () => o.complete(),
    });

    return () => {
      scription.unsubscribe();
      o.unsubscribe();
    };
  }),
);

/** 创建剪切板读取订阅 */
export const createClipboardTask = () => {
  ClipboardSubscription.add(clipboardSouce.subscribe({
    next: v => commands.executeCommand(CMD_KEY.STR_TO_I18N_CODE, v).then(() => console.log('读取最新剪切内容')),
  }));
};
