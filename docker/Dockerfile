FROM node:20-alpine as base
WORKDIR /app

COPY server/package.json server/tsconfig.json ./server/
COPY app ./app

WORKDIR /app/server
RUN npm install
COPY server/src ./src

EXPOSE 8787
CMD ["npm","run","dev"]
