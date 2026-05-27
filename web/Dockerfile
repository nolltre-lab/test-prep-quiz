# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /web
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
# Run linting to catch errors like missing imports
RUN npm run lint
# Build with default VITE_SERVER empty (we'll use nginx proxy)
RUN npm run build

# --- runtime stage (nginx serving + proxy /api and /socket.io) ---
FROM nginx:1.27-alpine
# nginx default user already non-root in alpine image for runtime

# Copy built assets
COPY --from=build /web/dist/ /usr/share/nginx/html/

# Nginx config that proxies API and socket.io to the server service name "server" (Compose network)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]