FROM alpine:3.13
RUN apk add nodejs npm
COPY . /opt
WORKDIR /opt
RUN NODE_ENV=production npm install
CMD node index.js