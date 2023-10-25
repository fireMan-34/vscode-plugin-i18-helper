import { createServer } from 'http';

const server = createServer((req, res) => {
  console.log('server->accept',);
  res.write('nothing');
  res.end('在线 mock',);
});

server.on('listening', () => {
  console.log('server -> start');
});

server.listen(3000);