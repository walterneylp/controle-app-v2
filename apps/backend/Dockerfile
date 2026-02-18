FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci
COPY apps/backend ./apps/backend
RUN npm run build -w apps/backend

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/backend/package*.json ./apps/backend/
RUN npm ci --production
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
EXPOSE 3333
USER node
CMD ["dumb-init", "node", "apps/backend/dist/index.js"]
