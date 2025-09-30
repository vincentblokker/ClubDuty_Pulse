# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Only copy package manifests first for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source and build TS
COPY tsconfig.json ./
COPY src ./src
RUN npm install -D typescript && npx tsc -p .

# Runtime image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
# Expose default API port
EXPOSE 5011
ENTRYPOINT ["node", "dist/server.js"]

