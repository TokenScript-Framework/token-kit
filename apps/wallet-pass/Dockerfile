FROM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci -d --foreground-scripts

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

FROM node:20-alpine

COPY --from=0 /usr/src/app/dist/ /usr/src/app/

ENV FASTIFY_PORT=3006
ENV FASTIFY_ADDRESS=0.0.0.0
EXPOSE ${FASTIFY_PORT}

RUN apk add --no-cache tini su-exec
RUN adduser -s /bin/false -S -D -H app

WORKDIR /usr/src/app/
ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["su-exec", "app", "node", "/usr/src/app/index.js"]
