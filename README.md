### База

#### Генерация модели после изменения файла `prisma/schema.prisma` 

`npx prisma generate`

#### Запуск миграции  

Генерация и создания миграции  

`npx prisma migrate dev --name init_films`

init_films - название миграции

#### Доп

npx prisma studio       # открывает веб-интерфейс для работы с данными  
npx prisma migrate status # проверка состояния миграций  
npx prisma migrate reset  # сброс базы и миграций (dev)

### Proto 

Генерация файлов после изменения proto файлов  

`npm run proto:gen`

## Start

`docker compose --profile default up --build `

Only DB  

`docker-compose --profile db-only up -d`