# http-proxied

`http-proxied` is a simple, zero-dependencies and zero-configuration command-line http proxy server.  
It is powerful enough for production usage, but it's simple and hackable enough to be used for testing, local development, and learning.

It is meant to be run in a docker container bound to a docker network.

## Usage

Start transparent proxy forwarding all requests on <port>: 
```bash
npx http-proxied [port] [source:destination] [source:destination] ...
```

## Docker example

A typical Docker scenario is having different containers not bound on host port but:
- you need containers to resolve/reach to each other
- you need to resolve/reach containers from host
- you need all of this with proper hostnames

Create a test network:
```bash
docker network create test
```

Run 2 containers, attach them to network with wanted hostnames aliases, and fire a dummy webserver:
```bash
# first terminal, first webserver
docker run --name aaa --rm -ti --network=test --network-alias=aaa.com alpine sh
apk add npm curl
echo aaa > index.html
npx http-server -p 80 .

# second terminal, second webserver
docker run --name bbb --rm -ti --network=test --network-alias=bbb.com alpine sh
apk add npm curl
echo bbb > index.html
npx http-server -p 80 .
```

Both containers are happily running and can see themselves and each other:
```bash
docker exec -ti aaa curl aaa.com # aaa resolves aaa.com
docker exec -ti aaa curl bbb.com # aaa resolves bbb.com

docker exec -ti bbb curl aaa.com # bbb resolves aaa.com
docker exec -ti bbb curl bbb.com # bbb resolves bbb.com
```

**Here the magic happens**

Add to `/etc/hosts` containers hostnames:
```bash
vim /etc/hosts
127.0.0.1 localhost aaa.com bbb.com
```

Fire the proxy on port 80:
```bash
docker run --name proxy --rm -ti --network=test -p 80:80 node:14-alpine npx http-proxied 80 
```

⚠️
Remember:
- the proxy must be attached on the network of containers with `--network=test` 
- the proxied request hostname must not resolve to same IP `http-proxied` is running on, or you will cause and endless loop! ⚠️ 