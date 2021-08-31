#!/usr/bin/env node
import http from 'http';

const port = process.argv[2] || '80';

const source2destination = {};

for (const map of process.argv.slice(3)) {
  const [source, destination] = map.split(':');
  source2destination[source] = destination;
}

console.log('Source-to-destination map:', source2destination);

const onRequest = (request, response) => {
  const source = request.headers.host;
  const destination = source2destination[source] || source;

  console.log(`${new Date().toISOString()} ${request.method} ${request.headers.host}${request.url} => ${destination}${request.url}`);

  const options = {
    hostname: destination,
    protocol: request.protocol,
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
