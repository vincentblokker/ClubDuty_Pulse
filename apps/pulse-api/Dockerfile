# API Dockerfile
FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package.json yarn.lock* ./
COPY apps/pulse-api/package.json apps/pulse-api/package.json
RUN yarn install --frozen-lockfile || yarn install

# Copy source
COPY . .
WORKDIR /app/apps/pulse-api

# Build & run
RUN yarn build
EXPOSE 5011
CMD ["yarn", "start"]
