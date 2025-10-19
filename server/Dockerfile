# Multiplayer Quick-Quiz server
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev

COPY index.js ./index.js
COPY packs ./packs

EXPOSE 8793
CMD ["node", "index.js"]