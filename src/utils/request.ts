import http from 'http';
import https from 'https';
import type { RequestOptions, IncomingMessage } from 'http';

enum ResponseTypeEnum {
  JSON = 'application/json',
  XML = 'application/xml',
  HTML = 'application/html',
  TEXT = 'text/plain',
  AUTO = 'AUTO',
};


const paraseIncomingMessageMeta = (incomingMessage: IncomingMessage): {
  dataType: ResponseTypeEnum,
  encording: BufferEncoding,

} => {
  const ContentType = incomingMessage.headers['content-type'] ?? 'application/json; charset=utf-8';
  const [
    contentType,
    charset,
  ] = ContentType.split(';');

  let dataType: ResponseTypeEnum;

  switch (contentType) {
    case ResponseTypeEnum.JSON:
      dataType = ResponseTypeEnum.JSON;
    break;
    case ResponseTypeEnum.XML:
      dataType = ResponseTypeEnum.XML;
    break;
    case ResponseTypeEnum.HTML:
      dataType = ResponseTypeEnum.HTML;
    break;
    case ResponseTypeEnum.TEXT:
      dataType = ResponseTypeEnum.TEXT;
    break;
    case ResponseTypeEnum.AUTO:
    default:
      dataType = ResponseTypeEnum.JSON;
  }

  function getEncording(encoding?: string): BufferEncoding {
    const encordings: BufferEncoding[] = [
      'ascii',
      'base64',
      'base64url',
      'utf-8',
      'binary',
      'hex',
      'latin1',
      'ucs-2',
      'utf16le',
    ];

    return encoding ? encordings.find(bufferEncoridng => encoding.includes(bufferEncoridng)) ?? 'utf-8' : 'utf-8';
  }


  return {
    dataType,
    encording: getEncording(charset),
  };
};

export interface IRequestX extends RequestOptions {
  onCallback?: (incomingMessage: IncomingMessage) => void;
}

export function requestX(options: IRequestX) {
  const {
    onCallback,
    ...opt
  } = {
    ...options,
  };
  const request = http.request;
  const clientReq = request(opt, onCallback);

  const responsePromise = new Promise((resolve, reject) => {

    clientReq.on('response', response => {
      const dataBox = [];
      // 客户端请求体返回的是 可读流
      let result: unknown;
      response.on('data', (data: unknown) => {
        dataBox.push(data);
        const meta = paraseIncomingMessageMeta(response);

        if (data instanceof Buffer) {
          const originContent = data.toString(meta.encording);
          if (ResponseTypeEnum.JSON === meta.dataType) {
            const parseContent = JSON.parse(originContent);
            result = parseContent;
          }
          if (ResponseTypeEnum.TEXT === meta.dataType) {
            result = originContent;
          }
          resolve(result);
        }
      });
    });

    clientReq.on('finish', () => {
    });

    clientReq.on('error', reject);

    // clientReq.on('connect', () => console.log('Connect',));
    // clientReq.on('abort', () => console.log('Abort'));
    // clientReq.on('close', () => console.log('Close'));
    // clientReq.on('continue', () => console.log('Continue'));
    // clientReq.on('error', () => console.log('Error'));
    // clientReq.on('drain', () => console.log('Drain'));
    // clientReq.on('finish', () => console.log('Finish'));
    // clientReq.on('information', () => console.log('Information'));
    // clientReq.on('socket', () => console.log('Socket'));
    // clientReq.on('pipe', () => console.log('Pipe'));
    // clientReq.on('timeout', () => console.log('Timeout'));
    // clientReq.on('upgrade', () => console.log('Upgrade'));
    // clientReq.on('unpipe', () => console.log('Unpipe'));
  });

  clientReq.end();

  return [
    clientReq,
    responsePromise,
  ] as const;
};