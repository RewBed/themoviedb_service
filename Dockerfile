# -------------------------------
# Stage 1: сборка
# -------------------------------
FROM node:20-alpine AS builder

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код
COPY . .

# Генерация Prisma клиента
RUN npx prisma generate

# Генерация ts-proto файлов
RUN npx protoc \
    --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=./ \
    --ts_proto_opt=nestJs=true,addGrpcMetadata=true,outputServices=grpc-js \
    src/proto/*.proto

# Сборка TypeScript
RUN npm run build

# Копируем proto файлы в dist для prod
RUN mkdir -p dist/proto && cp src/proto/*.proto dist/proto/

# -------------------------------
# Stage 2: runtime
# -------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

# Копируем package.json и node_modules только для prod
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем билд и proto файлы из stage 1
COPY --from=builder /app/dist ./dist

# Открываем порты REST и gRPC
EXPOSE 3000
EXPOSE 50051

# Команда запуска prod
CMD ["node", "dist/src/main.js"]
