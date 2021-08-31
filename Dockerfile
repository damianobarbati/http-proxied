FROM alpine:3.14
COPY ./ /opt
WORKDIR /opt
RUN apk add nodejs
ENTRYPOINT ["node", "src/index.js"]