import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { TmdbCollectorController } from "./tmdb_collector.controller";
import { TmdbCollectorService } from "./tmdb_collector.service";
import { TmdbPagesProcessor } from "./tmdb-collector-pages.processor";
import { TmdbMoviesProcessor } from "./tmdb-collector-movies.processor";
import { MovieListModule } from "src/movie_list/movie_list.module";

@Module({
  imports: [
    // Подключение к Redis для всех очередей
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),

    // Очередь для страниц
    BullModule.registerQueue({
      name: 'tmdbCollectorPages',
    }),

    // Очередь для деталей фильмов
    BullModule.registerQueue({
      name: 'tmdbCollectorMovies',
    }),

    MovieListModule
  ],
  providers: [TmdbCollectorService, TmdbPagesProcessor, TmdbMoviesProcessor],
  controllers: [TmdbCollectorController],
})
export class TmdbCollectorModule {}
