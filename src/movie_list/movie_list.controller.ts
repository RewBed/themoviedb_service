import { Controller, Post, Body } from '@nestjs/common';
import { MovieListService } from './movie_list.service';

@Controller('movie-list')
export class MovieListController {
  constructor(private readonly movieListService: MovieListService) {}

  @Post('fetch')
  async fetch(@Body() body: { startPage?: number; endPage?: number }) {
    const { startPage = 1, endPage = 1 } = body;

    // await this.movieListService.fetchTopRatedMovies(startPage, endPage);

    // Запуск в фоне
    setImmediate(() => {
      this.movieListService.fetchTopRatedMovies(startPage, endPage).catch(console.error);
    });

    return { status: 'started', startPage, endPage };
  }
}
