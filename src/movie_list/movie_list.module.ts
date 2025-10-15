import { Module } from '@nestjs/common';
import { MovieListService } from './movie_list.service';
import { MovieListController } from './movie_list.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FILMS_SERVICE', // токен, который будем использовать в @Inject
        transport: Transport.GRPC,
        options: {
          package: 'films', // package из proto
          protoPath: path.join(process.cwd(), 'src', 'proto', 'films.proto'), // путь к .proto
          url: process.env.FILMS_GRPC_URL || '127.0.0.1:50057', // адрес gRPC сервиса
        },
      },
    ]),
  ],
  providers: [MovieListService],
  controllers: [MovieListController],
  exports: [MovieListService], // если сервис будет использоваться в других модулях
})
export class MovieListModule {}
