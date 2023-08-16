FROM node:18.17-alpine
WORKDIR /opt/app
ADD package*.json /opt/app/
RUN npm ci
ADD . .
RUN npm run build && npm prune --omit=dev
CMD ["node", "./dist/main.js"]
