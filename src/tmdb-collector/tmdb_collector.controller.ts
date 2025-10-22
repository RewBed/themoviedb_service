import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';
import { TmdbCollectorService } from './tmdb_collector.service';

@Controller('tmdb-collector')
export class TmdbCollectorController {
  constructor(
    private readonly collectorService: TmdbCollectorService,
    @InjectQueue('tmdbCollectorPages') private readonly pagesQueue: Queue,
    @InjectQueue('tmdbCollectorMovies') private readonly moviesQueue: Queue,
  ) {}

  // Запуск выгрузки топовых фильмов
  @Post('populate')
  async start(@Body() body: { startPage: number; endPage: number }): Promise<string> {
    await this.collectorService.fetchTopRatedFilms(body.startPage, body.endPage); // Пример: от 1 до 500 страницы
    return 'Tasks added to queues';
  }

  // Проверка прогресса очереди страниц
  @Get('progress/pages')
  async getPagesProgress() {
    const jobs = await this.pagesQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const total = jobs.length;
    const completed = await this.pagesQueue.getCompletedCount();
    const failed = await this.pagesQueue.getFailedCount();
    return { total, completed, failed, remaining: total - completed - failed };
  }

  // Проверка прогресса очереди фильмов
  @Get('progress/movies')
  async getMoviesProgress() {
    const jobs = await this.moviesQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const total = jobs.length;
    const completed = await this.moviesQueue.getCompletedCount();
    const failed = await this.moviesQueue.getFailedCount();
    return { total, completed, failed, remaining: total - completed - failed };
  }

  // Для примера: запуск конкретной страницы вручную
  @Get('page/:page')
  async enqueuePage(@Param('page') page: number) {
    await this.pagesQueue.add('getTopRatedPage', { page: Number(page) });
    return `Page ${page} added to queue`;
  }

  // Для примера: запуск конкретного фильма вручную
  @Get('movie/:id')
  async enqueueMovie(@Param('id') movieId: number) {
    await this.moviesQueue.add('getMovieDetails', { movieId: Number(movieId) });
    return `Movie ${movieId} added to queue`;
  }
}
