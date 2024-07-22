FROM node:22 AS frontend-build
WORKDIR /app/frontend
COPY ./package.json ./yarn.lock ./
COPY ./tsconfig.json ./tsconfig.app.json ./tsconfig.node.json ./
COPY ./vite.config.ts ./
COPY ./src ./src
COPY ./public ./public
COPY index.html .env ./
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

FROM node:22
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist ./frontend
COPY --from=backend-build /app/backend/dist ./backend
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules

RUN npm install -g serve

EXPOSE 3000 5000

CMD ["sh", "-c", "serve -s frontend -l 3000 & node backend/index.js"]
