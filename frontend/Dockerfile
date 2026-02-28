# Multi-stage build for React frontend

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies (include devDeps for vite build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production (1024MB heap to handle large MUI bundle on low-RAM instances)
ARG VITE_API_URL=http://localhost:8080
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build

# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static content
RUN rm -rf ./*

# Copy built app from build stage
COPY --from=build /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
