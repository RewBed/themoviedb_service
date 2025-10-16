# 1️⃣ Билд-этап
FROM node:20-alpine AS builder
WORKDIR /app

# 2️⃣ Копируем package.json и ставим зависимости
COPY package*.json ./
RUN npm ci

# 3️⃣ Копируем код
COPY . .

# 5️⃣ Генерируем ts-proto файлы
RUN npx protoc \
    --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=./ \
    --ts_proto_opt=nestJs=true,addGrpcMetadata=true,outputServices=grpc-js \
    src/proto/*.proto

# 6️⃣ Собираем TypeScript
RUN npm run build


# 7️⃣ Runtime-этап
FROM node:20-alpine
WORKDIR /app

# 8️⃣ Копируем необходимые части из builder-а
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/proto ./src/proto

# 🔟 Выполняем миграции при запуске и стартуем приложение
CMD node dist/src/main.js

# Порты
EXPOSE 3000
EXPOSE 50051
