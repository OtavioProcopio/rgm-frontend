# ========================================
# Stage 1: Build
# ========================================
FROM node:26-alpine AS build

WORKDIR /app

COPY app/package*.json ./

RUN npm ci

COPY app .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ========================================
# Stage 2: Serve
# ========================================
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Hostname do backend resolvido em runtime via envsubst (apenas BACKEND_URL).
# Default compatível com EasyPanel/Docker Swarm; sobrescreva para dev local.
ENV BACKEND_URL=http://rgm_rap_backend:8080
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

EXPOSE 80
