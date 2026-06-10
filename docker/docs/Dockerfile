FROM oven/bun:1.1-alpine AS build
WORKDIR /app
COPY package.json bunfig.toml ./
COPY apps/docs/package.json ./apps/docs/
RUN bun install --frozen-lockfile

COPY . .
RUN bun --cwd apps/docs build

FROM nginx:alpine
COPY --from=build /app/apps/docs/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
