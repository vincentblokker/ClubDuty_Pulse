# Web Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package.json yarn.lock* ./
COPY apps/pulse-web/package.json apps/pulse-web/package.json
RUN yarn install --frozen-lockfile || yarn install

# Build
COPY . .
WORKDIR /app/apps/pulse-web
RUN yarn build

# Serve with a simple node server (vite preview)
EXPOSE 5173
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5173"]
