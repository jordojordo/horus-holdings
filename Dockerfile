FROM node:22 AS frontend-build
WORKDIR /app/frontend
COPY ./package.json ./yarn.lock ./
COPY ./tsconfig.json ./tsconfig.app.json ./tsconfig.node.json ./
COPY ./vite.config.ts ./
COPY ./src ./src
COPY ./public ./public
COPY index.html .env.production ./
RUN yarn
RUN yarn build

FROM node:22 AS backend-build
WORKDIR /app/backend
COPY ./server/package.json ./server/yarn.lock ./
COPY ./server/tsconfig.json ./
COPY ./server/src ./src
COPY ./server/.env ./
RUN yarn
RUN yarn build
EXPOSE 5000 

FROM docker.io/nginx:latest AS production-stage

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get update && apt-get install -y nodejs

RUN mkdir /app
COPY --from=frontend-build /app/frontend/dist /app/frontend
COPY --from=backend-build /app/backend/dist /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules
COPY nginx.conf /etc/nginx/nginx.conf
COPY scripts/production.sh /app/production.sh

RUN chmod +x /app/production.sh
ENTRYPOINT ["/app/production.sh"]
