FROM node:10
RUN mkdir -p /app/example
WORKDIR /app
COPY ./ ./

RUN npm link

WORKDIR /app/example
# RUN npm install --production
RUN npm install
RUN npm link smart-redis-cache

CMD npm start