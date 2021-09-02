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

  console.log(`[${new Date().toISOString()}] ${request.method} ${request.headers.host}${request.url} => ${destination}${request.url}`);

  const proxiedHeaders = { ...request.headers };
  delete proxiedHeaders['host'];

  const options = {
    hostname: destination,
    port: 443,
    path: request.url,
    method: request.method,
    headers: proxiedHeaders,
  };

  const proxy = http.request(options, (proxied_response) => {
    response.writeHead(proxied_response.statusCode, proxied_response.headers);
    proxied_response.pipe(response);
  });

  request.pipe(proxy);
};

http.createServer(onRequest).listen(port, () => console.log(`Proxy listening on port ${port}`));
