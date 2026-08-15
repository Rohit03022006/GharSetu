# Multi-Stage Dockerfile for GharSetu React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Optimize layer caching for dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Ultra-lightweight Nginx server
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
