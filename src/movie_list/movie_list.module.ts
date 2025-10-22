import { Module } from '@nestjs/common';
import { MovieListService } from './movie_list.service';
import { MovieListController } from './movie_list.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'FILMS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'films',
            protoPath: path.join(process.cwd(), 'src', 'proto', 'films.proto'),
            url: configService.get<string>('FILMS_GRPC_URL'),
          },
        }),
      },
    ]),
  ],
  providers: [MovieListService],
  controllers: [MovieListController],
  exports: [MovieListService],
})
export class MovieListModule {}
