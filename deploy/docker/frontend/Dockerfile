FROM node:20 AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

RUN chown -R 101:101 /var/cache/nginx /var/run /run /usr/share/nginx/html /etc/nginx/conf.d

EXPOSE 8080
