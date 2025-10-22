import { Processor, Process } from "@nestjs/bull";
import type { Job } from "bull";
import { TmdbCollectorService } from "./tmdb_collector.service";
import { TopRatedPageJobData } from "./tmdb-collector.types";

@Processor('tmdbCollectorPages')
export class TmdbPagesProcessor {
  constructor(private readonly collectorService: TmdbCollectorService) {}

  @Process('getTopRatedPage')
  async handleTopRatedPage(job: Job<TopRatedPageJobData>) {
    const { page } = job.data;
    const data = await this.collectorService['tmdbApiClient'].getTopRated(page);

    console.log(`Страница ${page} загружена, фильмов: ${data.results.length}`);

    // Создаем задачи на каждый фильм
    for (const movie of data.results) {
      await this.collectorService.addMovieDetailsJob(movie.id);
    }
  }
}
