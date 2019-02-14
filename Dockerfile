FROM node:10 as library
RUN mkdir -p /smart-redis-cache

WORKDIR /smart-redis-cache
COPY ./package*.json ./
RUN npm install
COPY ./src ./src

FROM library as integration
RUN npm link

RUN mkdir -p /integration-test
WORKDIR /integration-test
COPY ./integration-test/package*.json ./
RUN npm install
COPY ./integration-test ./
RUN npm link smart-redis-cache
