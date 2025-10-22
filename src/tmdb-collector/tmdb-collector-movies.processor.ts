import { Processor, Process } from "@nestjs/bull";
import type { Job } from "bull";
import { TmdbCollectorService } from "./tmdb_collector.service";
import { MovieDetailsJobData } from "./tmdb-collector.types";
import { MovieListService } from "src/movie_list/movie_list.service";

@Processor('tmdbCollectorMovies')
export class TmdbMoviesProcessor {
  constructor(
    private readonly collectorService: TmdbCollectorService,
    private readonly movieListService: MovieListService
) {}

  @Process('getMovieDetails')
  async handleMovieDetails(job: Job<MovieDetailsJobData>) {
    const { movieId } = job.data;

    try {
      const movieDetails = await this.collectorService['tmdbApiClient'].getMovieDetails(movieId);
      console.log(`Детали фильма ${movieId} загружены`);
      
      // console.log(movieDetails);

      // Здесь можно вызвать gRPC сервис для сохранения
      // await this.collectorService.saveMovie(movieDetails);
      await this.movieListService.filmsServiceClient.upsertFilm(this.movieListService.mapMovieToFullFilmData(movieDetails)).toPromise();

    } catch (err) {
      console.error(`Ошибка при получении деталей фильма ${movieId}:`, err);
      throw err; // чтобы Bull знал, что задача не выполнена
    }
  }
}
