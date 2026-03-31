# Multi-stage build for Angular SPA

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Aumenta a memória disponível para o Node (útil em builds pesados) e instala dependências
# Usamos --legacy-peer-deps para evitar conflitos de versões de dependências comuns em templates como o Fuse
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Stage 2: Runtime
FROM nginx:alpine
# Copy the compiled files to Nginx
COPY --from=build /app/dist/fuse /usr/share/nginx/html
# Copy a custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
