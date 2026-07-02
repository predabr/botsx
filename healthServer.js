import http from 'node:http';

export function startHealthServer(client) {
  const port = Number(process.env.PORT);
  if (!Number.isFinite(port) || port <= 0) return null;

  const server = http.createServer((request, response) => {
    if (request.url === '/' || request.url === '/health') {
      const body = JSON.stringify({
        ok: true,
        ready: Boolean(client?.isReady?.()),
        uptime: Math.round(process.uptime())
      });

      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      response.end(body);
      return;
    }

    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: false, error: 'not_found' }));
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Health server ouvindo na porta ${port}`);
  });

  return server;
}
