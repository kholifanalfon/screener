FROM oven/bun:1.1-alpine AS build
WORKDIR /app
COPY package.json bunfig.toml ./
COPY apps/frontend/package.json ./apps/frontend/
RUN bun install --frozen-lockfile

COPY . .
RUN bun --cwd apps/frontend build

FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
