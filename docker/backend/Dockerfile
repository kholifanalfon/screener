FROM oven/bun:1.1-alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bunfig.toml /temp/dev/
COPY apps/backend/package.json /temp/dev/apps/backend/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun --cwd apps/backend build

FROM base AS release
COPY --from=prerelease /usr/src/app/apps/backend/dist ./dist
COPY --from=prerelease /usr/src/app/apps/backend/package.json ./package.json
COPY --from=prerelease /usr/src/app/node_modules ./node_modules

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "dist/index.js" ]
