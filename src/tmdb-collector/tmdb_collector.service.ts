import { Injectable, OnModuleInit, Inject } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import type { Queue } from "bull";
import { ConfigService } from "@nestjs/config";
import { TmdbApiClient } from "src/tmdb/tmdb-api.client";
import { TopRatedPageJobData, MovieDetailsJobData } from "./tmdb-collector.types";

@Injectable()
export class TmdbCollectorService implements OnModuleInit {

  private tmdbApiClient: TmdbApiClient;

  constructor(
    @InjectQueue('tmdbCollectorPages') private readonly pagesQueue: Queue,
    @InjectQueue('tmdbCollectorMovies') private readonly moviesQueue: Queue,
    private readonly config: ConfigService
  ) {
    this.tmdbApiClient = new TmdbApiClient(
      config.get<string>('TMDB_API_KEY') || '',
      'ru-RU'
    );
  }

  onModuleInit() {}

  // Запускаем сбор страниц
  async fetchTopRatedFilms(startPage: number, endPage: number): Promise<void> {
    for (let page = startPage; page <= endPage; page++) {
      await this.pagesQueue.add('getTopRatedPage', { page } as TopRatedPageJobData, {
        attempts: 5, // повтор при ошибке
        backoff: 10000 // 10 секунд
      });
    }
  }

  // Создание задачи на детали фильма (внутри processor страниц)
  async addMovieDetailsJob(movieId: number): Promise<void> {
    await this.moviesQueue.add('getMovieDetails', { movieId } as MovieDetailsJobData, {
      attempts: 5,
      backoff: 10000
    });
  }
}
