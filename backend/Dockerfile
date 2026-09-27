# ---- Etapa de Compilación (Build) ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación (genera la carpeta dist/)
RUN npm run build

# ---- Etapa de Producción (Run) ----
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copiar package.json para instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar los archivos compilados desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto por el que escucha NestJS (por defecto 3000)
EXPOSE 3000

# Comando para iniciar la aplicación en producción
CMD ["node", "dist/main"]