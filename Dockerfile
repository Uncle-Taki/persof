FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm run build
FROM nginx:1.28-alpine
# Upgrade all Alpine packages to pick up patched CVE fixes (CI Trivy scan requirement).
# If nginx:1.28-alpine itself carries an unfixed upstream CVE that apk upgrade cannot
# resolve (i.e. no patched package exists in Alpine repos), that CVE must be documented
# in docs/WORKFLOW.md with disposition "unfixable upstream" rather than suppressed.
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
