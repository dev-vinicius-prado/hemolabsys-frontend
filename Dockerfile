# Multi-stage build for Angular SPA

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Runtime
FROM nginx:alpine
# Copy the compiled files to Nginx
COPY --from=build /app/dist/fuse /usr/share/nginx/html
# Copy a custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
