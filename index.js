#!/usr/bin/env node
import http from 'http';

const port = process.argv[2] || "80";

const onRequest = (request, response) => {
  console.log(`${new Date().toISOString()} ${request.method} ${request.headers.host}${request.url}`);

  const options = {
    hostname: request.headers.host,
    port,
    path: request.url,
    method: request.method,
    headers: request.headers,
  };

  const proxy = http.request(options, (proxied_response) => {
    response.writeHead(proxied_response.statusCode, proxied_response.headers);
    proxied_response.pipe(response, { end: true });
  });

  request.pipe(proxy, { end: true });
};

http.createServer(onRequest).listen(port, () => console.log(`Proxy listening on port ${port}`));