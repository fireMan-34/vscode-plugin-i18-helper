import { request } from 'http';
import type { RequestOptions } from 'http';

function requestX(options: RequestOptions) {
  const opt = {
    ...options,
  };
  const clientReq = request(opt);

  const responsePromise = new Promise((resolve, reject) => {

    clientReq.on('response', readStream => {
      console.log('触发 response ', readStream);
      const result = readStream.resume().read();
      resolve(result);
    });

    clientReq.on('error', reject);

    clientReq.on('connect', () => console.log('Connect',));
    clientReq.on('abort', () => console.log('Abort'));
    clientReq.on('close', () => console.log('Close'));
    clientReq.on('continue', () => console.log('Continue'));
    clientReq.on('error', () => console.log('Error'));
    clientReq.on('drain', () => console.log('Drain'));
    clientReq.on('finish', () => console.log('Finish'));
    clientReq.on('information', () => console.log('Information'));
    clientReq.on('socket', () => console.log('Socket'));
    clientReq.on('pipe', () => console.log('Pipe'));
    clientReq.on('timeout', () => console.log('Timeout'));
    clientReq.on('upgrade', () => console.log('Upgrade'));
    clientReq.on('unpipe', () => console.log('Unpipe'));
  });

  clientReq.end();

  return [
    clientReq,
    responsePromise,
  ] as const;
};

const [res, pro] = requestX({
  port: 3000,
  host: '127.0.0.1',
  method: 'GET',
});

pro.then(console.log);