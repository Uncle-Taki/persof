FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm run build
FROM nginx:alpine
# Upgrade all Alpine packages to pick up patched CVE fixes (CI Trivy scan requirement).
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
