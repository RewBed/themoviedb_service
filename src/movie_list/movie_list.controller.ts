import { Controller, Post, Body } from '@nestjs/common';
import { MovieListService } from './movie_list.service';
// import { MovieCollectorService } from 'src/tmdb-collector/movie-collector.service';

@Controller('movie-list')
export class MovieListController {
  constructor(
    private readonly movieListService: MovieListService,
    // private readonly movieCollectorService: MovieCollectorService
  ) {}

  @Post('fetch')
  async fetch(@Body() body: { startPage?: number; endPage?: number }) {
    const { startPage = 1, endPage = 1 } = body;

    // this.movieCollectorService.addTestJob();

    // Запуск в фоне
    setImmediate(() => {
      this.movieListService.fetchTopRatedMovies(startPage, endPage).catch(console.error);
    });

    return { status: 'started', startPage, endPage };
  }
}
