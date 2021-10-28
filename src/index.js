#!/usr/bin/env node
import http from 'http';
import tls from 'tls';

const source2destination = {};

for (const map of process.argv.slice(3)) {
  const [source, destination] = map.split(':');
  source2destination[source] = destination;
}

console.log('Source-to-destination map:', source2destination);

const onRequest = (request, response) => {
  console.log(request.protocol === 'https');
  return;
  const source = request.headers.host;
  const destination = source2destination[source] || source;

  console.log(`[${new Date().toISOString()}] ${request.method} ${request.headers.host}${request.url} => ${destination}${request.url}`);

  const proxiedHeaders = { ...request.headers };
  delete proxiedHeaders['host'];

  const options = {
    hostname: destination,
    port: 80,
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

http.createServer(onRequest).listen(80, () => console.log(`Proxy listening on port 80`));
http.createServer(onRequest).listen(443, () => console.log(`Proxy listening on port 443`));
